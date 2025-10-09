import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { TipoPartida } from "./TipoPartida";
import { Local } from "./Local";
import { PartidaUsuario } from "./PartidaUsuario";

@Entity("partida")
export class Partida {
  @PrimaryGeneratedColumn()
  id!: number;
  
  @Column({ type: "text" })
  data!: string;

  @Column({ type: "time" })
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
