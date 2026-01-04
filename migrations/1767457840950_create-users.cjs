exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createExtension("uuid-ossp", { ifNotExists: true });

  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("uuid_generate_v4()")
    },
    email: {
      type: "text",
      notNull: true,
      unique: true
    },
    password_hash: {
      type: "text",
      notNull: true
    },
    role: {
      type: "text",
      notNull: true,
      default: "student"
    },
    name: {
      type: "text",
      notNull: false
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()")
    }
  });

  pgm.addConstraint("users", "users_role_check", {
    check: "role in ('student','admin')"
  });

  pgm.createIndex("users", "email", { unique: true });
};

exports.down = (pgm) => {
  pgm.dropTable("users");
};