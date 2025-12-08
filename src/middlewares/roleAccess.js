
// const roleAccess = ({ rolePermissions }) => {
//   return (requiredPermission) => (req, res, next) => {
//     const user = req.user;

//     if (!user || !user.role) {
//       return res.status(401).json({ message: "User not authenticated" });
//     }

//     const allowed = rolePermissions[user.role] || [];

//     if (!allowed.includes(requiredPermission)) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     next();
//   };
// };

// module.exports = roleAccess;