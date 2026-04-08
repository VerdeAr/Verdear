export default (sequelize, Sequelize) => {
	return sequelize.define(
		"venda",
		{
			id_venda: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				allowNull: false,
				primaryKey: true,
			},
			id_cliente: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			data_venda: {
				type: Sequelize.DATE,
				allowNull: true,
			},
			tipo_entrega: {
				type: Sequelize.STRING(20),
				allowNull: true,
			},
			valor_total: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: true,
			},
			status: {
				type: Sequelize.STRING(20),
				allowNull: true,
			},
		},
		{
			tableName: "venda", // Força o Sequelize a usar EXATAMENTE 'venda'
			freezeTableName: true, // Garante que o nome não será pluralizado
			timestamps: false, // Desativa os campos automáticos de timestamp
		},
	);
};
