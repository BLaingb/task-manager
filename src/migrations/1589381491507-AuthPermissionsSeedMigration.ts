import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';
import { Permission } from '../users/models/permission.model';

const permissions = [
  'user:view',
  'user:list',
  'user:create',
  'user:update',
  'user:delete',
  'role:view',
  'role:list',
  'role:create',
  'role:update',
  'role:delete',
  'role:set',
  'permission:view',
  'permission:list'
];

export class AuthPermissionsSeedMigration1589381491507 implements MigrationInterface {
  public async up(_: QueryRunner): Promise<any> {
    const entities = [];
    for (const perm of permissions) {
      entities.push({ name: perm });
    }
    await getRepository<Permission>('permission').save(entities);
  }

  public async down(_: QueryRunner): Promise<any> {
    const entities = await getRepository<Permission>('permission').find({ where: { name: permissions } });
    await getRepository<Permission>('permission').remove(entities);
  }
}
