# Regras do AI Studio para o Aplicativo

Este documento descreve a pilha de tecnologia e as diretrizes para o desenvolvimento deste aplicativo no AI Studio.

## Pilha de Tecnologia

*   **Framework Frontend:** React.js para a construção de interfaces de usuário interativas.
*   **Linguagem:** TypeScript para segurança de tipo e melhoria da qualidade do código.
*   **Ferramenta de Build:** Vite para uma experiência de desenvolvimento rápida e builds otimizados.
*   **Estilização:** Tailwind CSS para estilização utilitária e responsiva.
*   **Componentes UI:** shadcn/ui para componentes de UI pré-construídos, acessíveis e personalizáveis.
*   **Roteamento:** React Router para roteamento declarativo no lado do cliente.
*   **Ícones:** Lucide React para um conjunto abrangente de ícones SVG personalizáveis.
*   **Backend e Banco de Dados:** Supabase para autenticação, banco de dados em tempo real e funções de borda (Edge Functions) serverless.

## Regras de Uso de Bibliotecas

*   **Componentes UI:** Sempre priorize os componentes `shadcn/ui`. Se um componente específico não estiver disponível ou exigir um desvio significativo do design do `shadcn/ui`, crie um novo componente personalizado usando Tailwind CSS.
*   **Estilização:** Utilize exclusivamente as classes do `Tailwind CSS` para toda a estilização. Evite arquivos CSS personalizados ou outras bibliotecas de estilização.
*   **Roteamento:** Use `React Router` para todo o gerenciamento de navegação e rotas dentro do aplicativo. Mantenha as rotas definidas em `src/App.tsx`.
*   **Ícones:** Utilize `Lucide React` para todas as necessidades de ícones.
*   **Serviços de Backend:** `Supabase` é a plataforma designada para todas as funcionalidades de backend, incluindo autenticação, interações com o banco de dados e funções de borda serverless.
*   **Gerenciamento de Estado:** Para o estado local do componente, use os hooks `useState` e `useReducer` nativos do React. Para o estado global, a `React Context API` é preferida pela simplicidade. Evite bibliotecas complexas de gerenciamento de estado, a menos que seja explicitamente necessário para aplicações em larga escala.
*   **Requisições HTTP:** Use a API nativa `fetch` para fazer requisições HTTP.
*   **Notificações:** Use `react-hot-toast` para exibir notificações ao usuário (por exemplo, mensagens de sucesso, erro).