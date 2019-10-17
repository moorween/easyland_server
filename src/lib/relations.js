module.exports = models => {
    models.projects.belongsTo(models.clients);
    models.projects.belongsToMany(models.users,
        {
            as: 'members',
            through: models.projects_members,
            foreignKey: 'projectId'
        }
    )
    models.users.belongsToMany(models.projects,
        {
            as: 'activeProjects',
            through: models.projects_members,
            foreignKey: 'userId'
        }
    )
    models.templates.belongsToMany(models.categories,
        {
            as: 'categories',
            through: models.templates_categories,
            foreignKey: 'templateId'
        }
    )
}
