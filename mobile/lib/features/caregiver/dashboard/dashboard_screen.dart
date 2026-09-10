import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

/// Dashboard básico del cuidador (multi-usuario).
/// Muestra el estado en tiempo real de los usuarios vinculados.
class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Datos de ejemplo
    final users = [
      _UserStatus('Ana', 'Cepillarse los dientes', 'completed', '08:05'),
      _UserStatus('Luis', 'Desayunar', 'pending', '08:30'),
      _UserStatus('María', 'Preparar mochila', 'late', '07:45'),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('RutinaQR – Cuidador'),
        backgroundColor: AppTheme.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add),
            tooltip: 'Añadir usuario',
            onPressed: () {
              // TODO: flujo de invitación
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          // TODO: crear rutina
        },
        icon: const Icon(Icons.add),
        label: const Text('Nueva rutina'),
        backgroundColor: AppTheme.primary,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Usuarios vinculados',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 12),
          ...users.map((u) => _UserCard(status: u)),
        ],
      ),
    );
  }
}

class _UserStatus {
  final String name;
  final String currentActivity;
  final String state; // completed | pending | late
  final String time;

  _UserStatus(this.name, this.currentActivity, this.state, this.time);
}

class _UserCard extends StatelessWidget {
  final _UserStatus status;

  const _UserCard({required this.status});

  Color get _color {
    switch (status.state) {
      case 'completed':
        return AppTheme.success;
      case 'late':
        return AppTheme.error;
      default:
        return AppTheme.warning;
    }
  }

  String get _label {
    switch (status.state) {
      case 'completed':
        return 'Completado';
      case 'late':
        return 'Atrasado';
      default:
        return 'Pendiente';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        leading: CircleAvatar(
          backgroundColor: _color.withOpacity(0.15),
          child: Text(
            status.name[0],
            style: TextStyle(
              color: _color,
              fontWeight: FontWeight.bold,
              fontSize: 20,
            ),
          ),
        ),
        title: Text(
          status.name,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
        ),
        subtitle: Text('${status.currentActivity} · ${status.time}'),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: _color.withOpacity(0.15),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            _label,
            style: TextStyle(
              color: _color,
              fontWeight: FontWeight.w700,
              fontSize: 13,
            ),
          ),
        ),
      ),
    );
  }
}
