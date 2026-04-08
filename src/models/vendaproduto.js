export default (sequelize, Sequelize) => {
	return sequelize.define(
		"vendaproduto",
		{
			id_venda_produto: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				allowNull: false,
				primaryKey: true,
			},
			id_venda: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			id_produto: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			quantidade: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: true,
			},
			preco_unitario: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: true,
			},
		},
		{
			tableName: "vendaproduto", // Força o Sequelize a usar EXATAMENTE 'vendaproduto'
			freezeTableName: true, // Garante que o nome não será pluralizado
			timestamps: false, // Desativa os campos automáticos de timestamp
		},
	);
};
