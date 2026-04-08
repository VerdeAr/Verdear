export default (sequelize, Sequelize) => {
	return sequelize.define(
		"produto",
		{
			id_produto: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				allowNull: false,
				primaryKey: true,
			},
			id_vendedor: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			id_categoria: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			nome_produto: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			descricao: {
				type: Sequelize.STRING(255),
				allowNull: true,
			},
			preco: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: true,
			},
			id_unidade_medida: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			ativo: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
			},
			url_imagem: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			estoque: {
				type: Sequelize.DECIMAL(10, 3),
				defaultValue: 0.0,
			},
		},
		{
			tableName: "produto", // Força o Sequelize a usar EXATAMENTE 'produto'
			freezeTableName: true, // Garante que o nome não será pluralizado
			timestamps: false, // Desativa os campos automáticos de timestamp
		},
	);
};
