export default (sequelize, Sequelize) => {
	return sequelize.define(
		"categoria",
		{
			id_categoria: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				allowNull: false,
				primaryKey: true,
			},
			nome_categoria: {
				type: Sequelize.STRING(50),
				allowNull: true,
			},
		},
		{
			tableName: "categoria", // Força o Sequelize a usar EXATAMENTE 'pessoa'
			freezeTableName: true, // Garante que o nome não será pluralizado
			timestamps: false, // Desativa os campos automáticos de timestamp
		},
	);
};
