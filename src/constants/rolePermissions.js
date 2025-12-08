const rolePermissions =({ roleconstants })=> {
    const {ADMIN, HR, TL, EMPLOYEE} = roleconstants

    return {
        [ADMIN]: ["view_users", "edit_users", "delete_users"],
        [HR]: ["view_users"],
        [TL]: ["view_users"],
        [EMPLOYEE]: []
    }
}

module.exports = rolePermissions;