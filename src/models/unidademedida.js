export default (sequelize, Sequelize) => {
	return sequelize.define(
		"unidademedida",
		{
			id_unidade_medida: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				allowNull: false,
				primaryKey: true,
			},
			nome_unidade_medida: {
				type: Sequelize.STRING(50),
				allowNull: true,
			},
		},
		{
			tableName: "unidademedida", // Força o Sequelize a usar EXATAMENTE 'unidademedida'
			freezeTableName: true, // Garante que o nome não será pluralizado
			timestamps: false, // Desativa os campos automáticos de timestamp
		},
	);
};
