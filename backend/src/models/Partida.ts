import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity("partida")
export class Partida extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  tipo!: string;

  @Column({ type: "date" })
  data!: Date;

  @Column({ type: "time" })
  hora!: string;

  @Column({ type: "int" })
  qtdjogadores!: number;

  @Column({ type: "text", nullable: true })
  time!: string; // Pode precisar de relacionamento no futuro

  @Column({ type: "text", nullable: true })
  placar!: string;
}
