module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      "settings": {
        "client": "mysql",
        "host": env('MYSQL_HOST'),
        "port": env('MYSQL_PORT'),
        "username": env('MYSQL_USERNAME'),
        "password": env('MYSQL_PASSWORD'),
        "database": env('MYSQL_DATABASE'),
      },
      options: {
        useNullAsDefault: true,
      },
    },
  },
});
