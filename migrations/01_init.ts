import Knex from 'knex'

export async function up (knex) {
    await knex.schema.createTable('processes', function (table) {
        table.increments('id');
        table.string('name', 32).notNullable();
        table.boolean('complete').notNullable().default(false);
        table.boolean('successful').default(null);
        table.json('origin');
        table.integer('currentStep').notNullable().default(0);

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
        table.json('directions')
        table.json('action')
        table.datetime('started')
        table.json('state')
        table.datetime('finished')
        table.index(['processId']);
    });
}

export async function down (knex) {
    knex.schema.dropTable('processes');
}
