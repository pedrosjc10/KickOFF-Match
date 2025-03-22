"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Partida = void 0;
const typeorm_1 = require("typeorm");
const Local_1 = require("./Local");
const Usuario_1 = require("./Usuario");
const TipoPartida_1 = require("./TipoPartida");
let Partida = class Partida extends typeorm_1.BaseEntity {
};
exports.Partida = Partida;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Partida.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "tinyint" }),
    __metadata("design:type", Number)
], Partida.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date" }),
    __metadata("design:type", Date)
], Partida.prototype, "data", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "time" }),
    __metadata("design:type", String)
], Partida.prototype, "hora", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 100 }),
    __metadata("design:type", String)
], Partida.prototype, "time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 45 }),
    __metadata("design:type", String)
], Partida.prototype, "placar", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Local_1.Local, (local) => local.partidas, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "local_id" }),
    __metadata("design:type", Local_1.Local)
], Partida.prototype, "local", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Usuario_1.Usuario, (usuario) => usuario.partidas, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "usuario_id" }),
    __metadata("design:type", Usuario_1.Usuario)
], Partida.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TipoPartida_1.TipoPartida, (tipoPartida) => tipoPartida.partidas, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "tipoPartida_idtipoPartida" }),
    __metadata("design:type", TipoPartida_1.TipoPartida)
], Partida.prototype, "tipoPartida", void 0);
exports.Partida = Partida = __decorate([
    (0, typeorm_1.Entity)("partida")
], Partida);
//# sourceMappingURL=Partida.js.map