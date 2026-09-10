import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:flutter/material.dart' show Color;
import '../models/activity.dart';

/// Genera un PDF listo para imprimir con uno o varios códigos QR de actividades.
/// Cada página puede contener varios QR con el nombre de la actividad debajo.
class QrPdfService {
  /// Genera el PDF y lo abre en el diálogo de impresión / compartir del sistema.
  static Future<void> printActivities(List<Activity> activities) async {
    final pdf = await _buildPdf(activities);
    await Printing.layoutPdf(
      onLayout: (_) async => pdf,
      name: 'RutinaQR_codigos.pdf',
    );
  }

  /// Solo genera los bytes del PDF (útil para guardar o subir).
  static Future<Uint8List> generatePdfBytes(List<Activity> activities) async {
    return _buildPdf(activities);
  }

  static Future<Uint8List> _buildPdf(List<Activity> activities) async {
    final doc = pw.Document();

    // 4 QR por página (2x2)
    const perPage = 4;
    for (var i = 0; i < activities.length; i += perPage) {
      final chunk = activities.skip(i).take(perPage).toList();
      doc.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          margin: const pw.EdgeInsets.all(24),
          build: (context) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Text(
                  'RutinaQR – Códigos de actividades',
                  style: pw.TextStyle(
                    fontSize: 18,
                    fontWeight: pw.FontWeight.bold,
                  ),
                ),
                pw.SizedBox(height: 8),
                pw.Text(
                  'Imprime y coloca cada código cerca del lugar de la actividad.',
                  style: const pw.TextStyle(fontSize: 11, color: PdfColors.grey700),
                ),
                pw.SizedBox(height: 20),
                pw.Wrap(
                  spacing: 20,
                  runSpacing: 24,
                  children: chunk.map((a) => _qrCard(a)).toList(),
                ),
              ],
            );
          },
        ),
      );
    }

    return doc.save();
  }

  static pw.Widget _qrCard(Activity activity) {
    final payload = activity.qrPayload ?? activity.id;

    return pw.Container(
      width: 240,
      padding: const pw.EdgeInsets.all(12),
      decoration: pw.BoxDecoration(
        border: pw.Border.all(color: PdfColors.grey400, width: 1),
        borderRadius: pw.BorderRadius.circular(8),
      ),
      child: pw.Column(
        children: [
          pw.BarcodeWidget(
            barcode: pw.Barcode.qrCode(),
            data: payload,
            width: 160,
            height: 160,
          ),
          pw.SizedBox(height: 10),
          pw.Text(
            activity.name,
            textAlign: pw.TextAlign.center,
            style: pw.TextStyle(
              fontSize: 14,
              fontWeight: pw.FontWeight.bold,
            ),
          ),
          if (activity.timeLabel.isNotEmpty)
            pw.Text(
              activity.timeLabel,
              style: const pw.TextStyle(fontSize: 11, color: PdfColors.grey700),
            ),
        ],
      ),
    );
  }
}
