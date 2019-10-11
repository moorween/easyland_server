module.exports = models => {
    models.projects.belongsTo(models.clients);
    models.projects.belongsToMany(models.users, { as: 'members', through: 'projects_members', foreignKey: 'projectId' })
}
