var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function up(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        yield knex.schema.createTable('processes', function (table) {
            table.increments('id');
            table.string('name', 32).notNullable();
            table.boolean('complete').notNullable().default(false);
            table.boolean('successful').default(null);
            table.integer('currentStep').default(null);
            table.index(['name']);
        });
        yield knex.schema.createTable('process_files', function (table) {
            table.increments('id');
            table.integer('processId').notNullable();
            table.foreign('processId').references('processes.id');
            table.text('name');
            table.text('encoding');
            table.text('data');
            table.index(['processId']);
        });
        yield knex.schema.createTable('process_steps', function (table) {
            table.increments('id');
            table.integer('processId').notNullable();
            table.foreign('processId').references('processes.id');
            table.integer('number').notNullable();
            table.string('handler', 32).notNullable();
            table.json('directions');
            table.json('action').default(null);
            table.datetime('started').defaultTo(knex.fn.now());
            table.json('state').notNullable();
            table.datetime('finished').default(null);
            table.index(['processId', 'number']);
        });
    });
}
export function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        yield knex.schema.dropTable('process_files');
        yield knex.schema.dropTable('process_steps');
        yield knex.schema.dropTable('processes');
    });
}
