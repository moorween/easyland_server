module.exports = models => {
    models.projects.belongsTo(models.clients);
    // models.projects.hasMany(models.users, { through: models.members});
    models.projects.belongsToMany(models.users, { as: 'members', through: 'projects_members', foreignKey: 'projectId' })
    // models.users.belongsToMany(models.projects, {through: 'project_members'});
    // models.projects.hasOne(models.clients);
}
