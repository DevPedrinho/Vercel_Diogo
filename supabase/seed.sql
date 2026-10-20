-- Conteúdo inicial: a planilha de presentes dos noivos, os padrinhos e a
-- linha do tempo. Rode uma vez, depois das migrações, num banco vazio.

insert into public.gifts (title, category, price_cents, description, sort_order) values
  ('Aparelho de jantar dos sonhos', 'Casa', 45000, 'Para receber a família e os amigos com uma mesa linda.', 1),
  ('Faqueiro Tramontina', 'Casa', 35000, 'Para nossas refeições, dos almoços simples aos jantares especiais.', 2),
  ('Fogão para as aventuras culinárias', 'Casa', 140000, 'Para preparar nossas receitas favoritas e alimentar muitos momentos felizes.', 3),
  ('Gelágua para refrescar a vida', 'Casa', 45000, 'Porque amor é bom, mas água gelada também é indispensável!', 4),
  ('Ar-condicionado para noites tranquilas', 'Casa', 160000, 'Para dormir juntinhos, com conforto e sem disputar o ventilador.', 5),
  ('Cortinas blackout', 'Casa', 25000, 'Para garantir escurinho, privacidade e aquelas manhãs de sono prolongado.', 6),
  ('Enxoval de cama dos sonhos', 'Casa', 50000, 'Para deixar nosso cantinho ainda mais confortável e cheio de carinho.', 7),
  ('Jogo de panelas', 'Casa', 65000, 'Para nossas experiências gastronômicas, inclusive as que derem errado.', 8),
  ('Depurador', 'Casa', 45000, 'Para uma cozinha sem fumaça e sem estresse.', 9),
  ('Torradeira do café da manhã', 'Casa', 18000, 'Para nossas manhãs começarem com pão quentinho.', 10),
  ('Jogo de taças e copos', 'Casa', 30000, 'Para brindar às pequenas e grandes conquistas.', 11),
  ('Panela de pressão elétrica', 'Casa', 50000, 'Para preparar refeições deliciosas sem passar horas na cozinha.', 12),
  ('1 Parcela da Lava e Seca', 'Casa', 30000, 'Uma contribuição para equipar nossa área de serviço.', 13),
  ('Ajuda na 1° viagem internacional do casal', 'Lua de Mel', 50000, 'Contribua para que possamos realizar nosso sonho de viajar para fora do país.', 14),
  ('Luminárias para noites aconchegantes', 'Casa', 30000, 'Para criar aquele clima gostoso no fim do dia.', 15),
  ('Jogo de toalhas macias', 'Casa', 20000, 'Para completar o enxoval com conforto e elegância.', 16),
  ('Fundo para a geladeira dos sonhos', 'Casa', 80000, 'Uma contribuição para conservar nossos alimentos e abastecer a casa nova.', 17),
  ('Nosso primeiro café de casados', 'Lua de Mel', 15000, 'Para começar a vida a dois com café, carinho e muito amor.', 18),
  ('Vale-jantar romântico', 'Lua de Mel', 25000, 'Para um encontro especial depois da correria do casamento.', 19),
  ('Patrocine nossa próxima viagem', 'Lua de Mel', 35000, 'Para colecionarmos novas paisagens e lembranças.', 20),
  ('Cinema sem sair de casa', 'Lua de Mel', 15000, 'Para pipoca, filmes e aquela discussão sobre quem escolhe o próximo.', 21),
  ('1 dose de Monjaro pra Noiva', 'Lua de Mel', 25000, 'Para dançarmos juntos, mesmo quando um de nós errar o passo.', 22),
  ('Dia de descanso dos recém-casados', 'Lua de Mel', 35000, 'Para desacelerar depois de organizar cada detalhe do casamento.', 23),
  ('Noite da pizza', 'Lua de Mel', 18000, 'Para cozinhar juntos ou pedir aquela pizza sem culpa.', 24),
  ('Um passeio surpresa', 'Lua de Mel', 25000, 'Para sair da rotina e criar uma memória inesperada.', 25),
  ('Vale um churrasco na nossa casa', 'Lua de Mel', 20000, 'Uma contribuição oficial para garantir que sempre te convidaremos.', 26),
  ('Fundo para nossas disputas de jogos', 'Lua de Mel', 18000, 'Para jogos, risadas e uma competição saudável (ou quase).', 27),
  ('Café da manhã na cama', 'Lua de Mel', 20000, 'Para surpreender um ao outro sem precisar sair do quarto.', 28),
  ('Vale o primeiro lugar na fila do jantar', 'Lua de Mel', 15000, 'Vamos garantir que você seja a primeira pessoa a ser servida no jantar do Buffet.', 29),
  ('Uma escapadinha a dois', 'Lua de Mel', 35000, 'Para um passeio especial e um tempo só nosso.', 30),
  ('Ajuda para organizar a casa', 'Casa', 25000, 'Para transformar caixas e bagunça em um lar cheio de personalidade.', 31),
  ('ANTI - TPM', 'Cota divertida', 18000, 'Para que o noivo sobreviva a esse período', 32),
  ('Paz na escolha do filme', 'Cota divertida', 20000, 'Para ver o filme que os dois escolherem sem passar uma hora procurando.', 33),
  ('Fundo contra a louça acumulada', 'Casa', 25000, 'Uma contribuição para ajudar a comprar nossa máquina de lavar louça', 34),
  ('Mala pronta para novas aventuras', 'Lua de Mel', 35000, 'Para ajudar a preparar a próxima viagem do casal.', 35),
  ('Nosso lar, nosso refúgio', 'Casa', 50000, 'Para investir em detalhes que deixem nossa casa ainda mais acolhedora.', 36),
  ('Fundo para realizar um sonho', 'Lua de Mel', 80000, 'Uma contribuição para transformar um dos nossos planos em realidade.', 37),
  ('Presente para nossa vida inteira', 'Lua de Mel', 100000, 'Para brindar ao amor, à parceria e a todos os sonhos que ainda vamos realizar juntos.', 38),
  ('Minoxidil para o noivo', 'Cota divertida', 25000, 'Para ajudar o noivo a cuidar do visual e manter a esperança de uma cabeleira de respeito no grande dia! 😂', 39);

insert into public.godparents (name, role, side, sort_order) values
  ('Rita & Roberto', 'Padrinhos', 'noiva', 1),
  ('Bárbara & Jean', 'Padrinhos', 'noiva', 2),
  ('Ismênia & José', 'Padrinhos', 'noiva', 3),
  ('Ludmylla & João Victor', 'Padrinhos', 'noiva', 4),
  ('Priscila & Breno', 'Padrinhos', 'noivo', 5),
  ('Thyago & Gleiciane', 'Padrinhos', 'noivo', 6),
  ('Patrick & Letícia', 'Padrinhos', 'noivo', 7),
  ('Yuri & Lara', 'Padrinhos', 'noivo', 8);

insert into public.story_events (date_label, title, description, sort_order) values
  ('2022', 'Um match inesperado', 'Tudo começou com uma conversa inesperada, daquelas que a gente nem imagina onde podem chegar.', 1),
  ('Amor e companheirismo', 'Do match ao amor', 'O que começou com um match se transformou em amor e companheirismo.', 2),
  ('Um lar compartilhado', 'Nosso lar', 'Dividimos a mesma casa, a mesma rotina e os mesmos sonhos.', 3),
  ('Quatro anos juntos', 'Sonhos e viagens', 'Quatro anos de sonhos, viagens e tantas histórias para contar.', 4),
  ('16 de janeiro de 2027', 'O nosso sim', 'Diante de Deus e de quem amamos, vamos celebrar tudo o que nos trouxe até aqui e dizer sim a uma vida inteira juntos — e não poderíamos imaginar esse dia sem você.', 5);

-- A música escolhida pelos noivos (o arquivo fica em public/audio).
update public.site_music set title = 'Partilhar', artist = 'Rubel' where id;

-- Fotos que já vieram com o site (pasta public).
update public.godparents set image_path = '/img/padrinhos/ludmylla-e-joao-victor.jpg' where name = 'Ludmylla & João Victor';
update public.godparents set image_path = '/img/padrinhos/thyago-e-gleiciane.jpg' where name = 'Thyago & Gleiciane';
update public.story_events set image_path = '/img/historia/o-comeco.jpg' where sort_order = 1;
update public.story_events set image_path = '/img/historia/vercia-e-diogo.jpg' where sort_order = 2;
update public.story_events set image_path = '/img/historia/viagem.jpg' where sort_order = 4;
update public.story_events set image_path = '/img/casal.png' where sort_order = 5;
update public.godparents set image_path = '/img/padrinhos/rita-e-roberto.jpg' where name = 'Rita & Roberto';
update public.story_events set image_path = '/img/historia/juntos.jpg' where sort_order = 3;
