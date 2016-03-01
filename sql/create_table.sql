create table tarefas
(
	id_tarefa serial not null
	, descr_tarefa varchar
	, cod_usuario integer
	, encerrada boolean default false
	, constraint tarefas_id_tarefa_pk primary key (id_tarefa)
	, constraint tarefas_cod_usuario_fk foreign key (cod_usuario)
	references usuarios (id_usuario) match simple
	on update cascade on delete cascade
);

create table tarefas_periodos
(
	id_tarefa_periodo serial not null
	, data_hora_tarefa_inicio timestamp without time zone
	, data_hora_tarefa_fim timestamp without time zone
	, cod_tarefa integer
	, constraint tarefas_periodos_id_tarefa_periodo_pk primary key (id_tarefa_periodo)
	, constraint tarefas_periodos_cod_tarefa_fk foreign key (cod_tarefa)
	references tarefas (id_tarefa) match simple
	on update cascade on delete cascade
)

alter table tarefas_periodos
	add periodo integer;