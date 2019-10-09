module.exports = models => {
    // models.Sites.hasMany(models.StoreRules);
    models.projects.belongsTo(models.clients);
    // models.projects.hasOne(models.clients);
}
