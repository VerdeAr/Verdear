import Sequelize from "sequelize";

const sequelize = new Sequelize("postgres", "root", "123", {
	host: "localhost",
	dialect: "postgres",
	port: 5432,
});

export default sequelize;
