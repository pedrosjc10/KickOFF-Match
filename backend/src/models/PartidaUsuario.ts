import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Partida } from "./Partida";
import { Usuario } from "./Usuario";

@Entity()
export class PartidaUsuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  confirmado!: boolean;

  @Column()
  organizador!: boolean;

  @ManyToOne(() => Partida, (partida) => partida.partidaUsuarios, { onDelete: 'CASCADE' })
  partida!: Partida;

  @ManyToOne(() => Usuario, (usuario) => usuario.partidaUsuarios, { onDelete: 'CASCADE' })
  usuario!: Usuario;
}