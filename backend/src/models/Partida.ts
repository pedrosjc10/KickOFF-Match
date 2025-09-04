import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { TipoPartida } from "./TipoPartida";
import { Local } from "./Local";
import { PartidaUsuario } from "./PartidaUsuario";

export enum TipoEnum {
  PRIVADO = 0,
  PUBLICO = 1,
}

@Entity("partida")
export class Partida {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "smallint",
    enum: TipoEnum, // agora o banco guarda 0 ou 1, mas no código tu usa o enum
  })
  tipo!: TipoEnum;

  @Column()
  data!: Date;

  @Column()
  hora!: string;

  @Column()
  nome!: string;

  // Relacionamento com TipoPartida
  @ManyToOne(() => TipoPartida)
  @JoinColumn({ name: 'tipopartida_idtipopartida' })
  tipoPartida!: TipoPartida;

  // Relacionamento com Local
  @ManyToOne(() => Local)
  @JoinColumn({ name: 'local_id' })
  local!: Local;

  // Relacionamento com PartidaUsuario
  @OneToMany(() => PartidaUsuario, partidaUsuario => partidaUsuario.partida)
  partidaUsuarios!: PartidaUsuario[];
}
