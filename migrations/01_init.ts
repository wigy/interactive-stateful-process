import Knex from 'knex'

export async function up (knex) {
    await knex.schema.createTable('processes', function (table) {
        table.increments('id');
        table.string('name', 32).notNullable();
        table.boolean('complete').notNullable().default(false);
        table.boolean('successful').default(null);
        table.json('origin');
        table.integer('currentStep').default(null);

        table.index(['name']);
    });

    await knex.schema.createTable('process_files', function (table) {
        table.increments('id');
        table.integer('processId').notNullable();
        table.foreign('processId').references('processes.id');
        table.text('name')
        table.text('encoding')
        table.text('data')

        table.index(['processId']);
    });

    await knex.schema.createTable('process_steps', function (table) {
        table.increments('id');

        table.integer('processId').notNullable();
        table.foreign('processId').references('processes.id');

        table.integer('number').notNullable();
        table.json('directions')
        table.json('action').default(null)
        table.datetime('started').defaultTo(knex.fn.now())
        table.json('state').notNullable()
        table.datetime('finished').default(null)

        table.index(['processId', 'number']);
    });
}

export async function down (knex) {
    await knex.schema.dropTable('processes');
    await knex.schema.dropTable('processe_files');
    await knex.schema.dropTable('processe_steps');
}
