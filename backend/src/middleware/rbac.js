const rolePrivileges = {
  admin: ['users:read', 'users:write', 'contacts:read', 'contacts:write'],
  manager: ['users:read', 'contacts:read', 'contacts:write'],
  agent: ['contacts:read', 'contacts:write'],
  viewer: ['contacts:read'],
};

function parsePrivileges(headerValue) {
  if (!headerValue) return null;
  return headerValue.split(',').map(s => s.trim()).filter(Boolean);
}

export function requirePrivilege(privilege) {
  return (req, res, next) => {
    const role = req.header('x-user-role');
    const headerPrivileges = parsePrivileges(req.header('x-user-privileges'));
    const effective = headerPrivileges ?? (role ? rolePrivileges[role] : null);
    if (!effective || !effective.includes(privilege)) {
      return res.status(403).json({ error: 'Sin privilegios suficientes' });
    }
    return next();
  };
}

export { rolePrivileges };
