export async function up(knex) {

    // Add user_id column
    await knex.schema.alterTable("transaction", (table) => {
        table.integer("user_id");
    });

    // Link user_ids to transactions
    await knex.raw(`
        UPDATE transaction t
        SET user_id = (
        SELECT id FROM account a WHERE a.username = t.username
    );`);
    // Drop the old username from the table    
    await knex.schema.alterTable("transaction", (table) => {
        table.dropColumn("username");
    })

    // Add sum
    await knex.schema.alterTable("transaction", (table) => {
        table.integer("sum");
    })

    // Initially insert everything to 0
    await knex("transaction").update({
        sum: 0
    });

    await knex.raw(`
  UPDATE transaction
  SET sum = transaction.amount * product.pricein
  FROM product
  WHERE transaction.product_name = product.name
`)
}

export async function down(knex) {
    // Add back the username column
    await knex.schema.alterTable("transaction", (table) => {
        table.string("username");
    });

    // Populate the username field (optional, if needed):
    // If you need to repopulate the username, you could write an update query here if you still have that data.

    // Remove the user_id column
    await knex.schema.alterTable("transaction", (table) => {
        table.dropColumn("user_id");
    });

    // Remove the sum column
    await knex.schema.alterTable("transaction", (table) => {
        table.dropColumn("sum");
    });
}

