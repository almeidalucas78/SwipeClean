# SwipeClean 📸

O **SwipeClean** é um aplicativo mobile desenvolvido em React Native projetado para otimizar e simplificar a organização da galeria de fotos do smartphone. 

Através de uma interface minimalista e intuitiva baseada em gestos (*swipe*), o aplicativo transforma a tarefa tediosa de apagar fotos em um processo rápido, eficiente e seguro.

## 🎯 O Problema que Resolvemos
O acúmulo de fotos, prints e vídeos indesejados consome rapidamente o armazenamento dos dispositivos móveis. Aplicativos de galeria tradicionais tornam a exclusão em massa um processo lento e sujeito a erros. O SwipeClean resolve isso oferecendo uma triagem focada (uma foto por vez) e exclusão em lote apenas após a revisão do usuário.

## 🚀 Principais Funcionalidades

* **Triagem por Gestos:** Deslize para a direita para manter a memória, ou para a esquerda para marcar o arquivo para exclusão.
* **Organização Cronológica:** Limpeza modular e organizada. As fotos são automaticamente agrupadas por mês e ano, evitando a sobrecarga cognitiva de uma galeria infinita.
* **Foco em Armazenamento (Pesos Pesados):** Módulo com gamificação em tempo real que ordena os arquivos pelo tamanho estimado. O usuário acompanha exatamente quantos Megabytes está liberando a cada ação.
* **Exclusão Segura:** Nenhuma foto é apagada acidentalmente. Os arquivos marcados vão para uma área de revisão temporária, exigindo a confirmação final do usuário antes da exclusão nativa da galeria.
* **Limpeza Inteligente (Em Breve):** Algoritmos de busca dedicados para encontrar e eliminar rapidamente capturas de tela (*screenshots*) e imagens residuais de mensageiros.

## 🛠️ Tecnologias Utilizadas

* **React Native / Expo:** Framework principal para desenvolvimento da interface mobile.
* **Expo Media Library:** Integração profunda e gerenciamento de permissões para manipulação nativa da galeria.
* **Animated API & Gesture Handler:** Motores de animação implementados para garantir interações de *swipe* fluidas e responsivas.