import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  BaseEntity, 
  ManyToOne,
  JoinColumn,
  OneToMany
} from "typeorm";
import { Local } from "./Local"; 
import { TipoPartida } from "./TipoPartida"; 
import { PartidaUsuario } from "./PartidaUsuario";

@Entity("partida")
export class Partida extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "boolean" })
  tipo!: number;

  @Column({ type: "date" })
  data!: Date;

  @Column({ type: "time" })
  hora!: string;

  @Column()
  nome!: string;

  @ManyToOne(() => Local, (local) => local.partidas, {
    onDelete: "CASCADE", 
  })
  @JoinColumn({ name: "local_id" })
  local!: Local;

  @ManyToOne(() => TipoPartida, (tipoPartida) => tipoPartida.partidas, {
    onDelete: "CASCADE", 
  })
  @JoinColumn({ name: "tipoPartida_idtipoPartida" })
  tipoPartida!: TipoPartida;

  @OneToMany(() => PartidaUsuario, (partidaUsuario) => partidaUsuario.partida)
partidaUsuarios!: PartidaUsuario[];
}
