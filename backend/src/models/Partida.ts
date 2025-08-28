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
    transformer: {
      to: (value: "privado" | "publico") => {
        return value === "privado" ? TipoEnum.PRIVADO : TipoEnum.PUBLICO;
      },
      from: (value: number) => {
        return value === TipoEnum.PRIVADO ? "privado" : "publico";
      },
    },
  })
  tipo!: "privado" | "publico";

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
