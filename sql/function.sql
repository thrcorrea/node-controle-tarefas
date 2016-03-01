create or replace function f_insere_tarefa(varchar, integer)
returns integer as 
$BODY$

declare

	v_descr_tarefa alias for $1;
	v_cod_usuario alias for $2;
	v_id_tarefa integer;

begin

	if (coalesce(trim(v_descr_tarefa),'') <> '') then

		insert into
			tarefas
			(
				descr_tarefa
				, cod_usuario
			)
			values
			(
				v_descr_tarefa
				, v_cod_usuario
			)
		returning id_tarefa into v_id_tarefa;

		if coalesce(v_id_tarefa, 0) > 0 then

			update
				tarefas_periodos
			set
				data_hora_tarefa_fim = cast(current_timestamp as timestamp without time zone)
			where
				cod_tarefa in (select id_tarefa from tarefas where cod_usuario = v_cod_usuario)
				and data_hora_tarefa_fim is null;

			insert into
				tarefas_periodos
				(
					data_hora_tarefa_inicio 
					, cod_tarefa
				)
				values
				(
					cast(current_timestamp as timestamp without time zone)
					, v_id_tarefa
				);

		end if;

	end if;

	return v_id_tarefa;

end;

$BODY$
language 'plpgsql';

select
	extract(hour from current_timestamp)

CREATE OR REPLACE FUNCTION public.f_preenche_periodo()
  RETURNS trigger AS
$BODY$
declare

	v_periodo float;

begin

	v_periodo = 0;

	if new.data_hora_tarefa_fim is not null then

		v_periodo = Extract(epoch from (new.data_hora_tarefa_fim - new.data_hora_tarefa_inicio)) / 60;

		if (extract(hour from new.data_hora_tarefa_inicio) <= 12) and (extract(hour from new.data_hora_tarefa_fim) >= 13) then

			v_periodo = v_periodo - 60;

		end if;

		new.periodo = v_periodo;

	end if;


	return new;
end;
$BODY$
  LANGUAGE plpgsql STABLE;

create trigger tg_preenche_periodo
before insert or update
on tarefas_periodos
for each row
execute procedure f_preenche_periodo();