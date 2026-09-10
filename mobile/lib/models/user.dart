enum UserRole { caregiver, user }

class AppUser {
  final String id;
  final String? email;
  final UserRole role;
  final String displayName;
  final String locale;
  final String? avatarUrl;

  const AppUser({
    required this.id,
    this.email,
    required this.role,
    required this.displayName,
    this.locale = 'es',
    this.avatarUrl,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] as String,
      email: json['email'] as String?,
      role: (json['role'] as String) == 'caregiver'
          ? UserRole.caregiver
          : UserRole.user,
      displayName: json['displayName'] as String? ??
          json['display_name'] as String? ??
          'Usuario',
      locale: json['locale'] as String? ?? 'es',
      avatarUrl: json['avatarUrl'] as String? ?? json['avatar_url'] as String?,
    );
  }

  bool get isCaregiver => role == UserRole.caregiver;
  bool get isUser => role == UserRole.user;
}
