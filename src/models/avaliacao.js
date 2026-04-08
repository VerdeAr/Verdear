// models/avaliacao.js
export default (sequelize, Sequelize) => {
	return sequelize.define(
		"avaliacao",
		{
			id_avaliacao: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				allowNull: false,
				primaryKey: true,
			},
			id_venda: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			id_cliente: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			nota: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			comentario: {
				type: Sequelize.STRING(255),
				allowNull: true,
			},
			data_avaliacao: {
				type: Sequelize.DATE,
				allowNull: true,
			},
		},
		{
			tableName: "avaliacao", // Força o Sequelize a usar EXATAMENTE 'avaliacao'
			freezeTableName: true, // Garante que o nome não será pluralizado
			timestamps: false, // Desativa os campos automáticos de timestamp
		},
	);
};
