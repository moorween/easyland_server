module.exports = models => {
    models.projects.belongsTo(models.clients);
    models.projects.belongsToMany(models.users.scope('active', 'defaultScope'),
        {
            as: 'members',
            through: models.projects_members,
            foreignKey: 'projectId'
        }
    )
    models.users.belongsToMany(models.projects.scope('active', 'withClient'),
        {
            as: 'activeProjects',
            through: models.projects_members,
            foreignKey: 'userId'
        }
    )
}
