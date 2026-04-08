export default (sequelize, Sequelize) => {
	return sequelize.define(
		"pessoa",
		{
			id_pessoa: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				allowNull: false,
				primaryKey: true,
			},
			nome_pessoa: {
				type: Sequelize.STRING(255),
				allowNull: true,
			},
			cpf: {
				type: Sequelize.STRING(11),
				allowNull: false,
				unique: true,
			},
			email: {
				type: Sequelize.STRING(100),
				allowNull: true,
			},
			senha: {
				type: Sequelize.STRING(50),
				allowNull: true,
			},
			endereco: {
				type: Sequelize.STRING(255),
				allowNull: true,
			},
			id_bairro: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			telefone: {
				type: Sequelize.STRING(20),
				allowNull: true,
			},
			tipo_usuario: {
				type: Sequelize.STRING(20),
				allowNull: true,
				defaultValue: "CLIENTE",
			},
			ativo: {
				type: Sequelize.BOOLEAN,
				allowNull: true,
			},
			frete_fixo: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: true,
				defaultValue: 0.0,
			},
		},
		{
			tableName: "pessoa", // Força o Sequelize a usar EXATAMENTE 'pessoa'
			freezeTableName: true, // Garante que o nome não será pluralizado
			timestamps: false, // Desativa os campos automáticos de timestamp
		},
	);
};
