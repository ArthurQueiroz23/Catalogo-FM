# Imagem de produção do backend (Railway).
#
# Multi-stage: a primeira etapa compila com o JDK completo + Maven, a segunda carrega só o JRE e
# o .jar. O resultado é uma imagem pequena, que não leva compilador nem código-fonte para o
# servidor.

# ---------------------------------------------------------------------------------------------
# Etapa 1 — build
# ---------------------------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /build

# O pom.xml vem sozinho primeiro, e as dependências são baixadas antes do código-fonte entrar na
# imagem. Assim o Docker reaproveita essa camada em todo deploy que não mexeu no pom — sem isso,
# cada push baixaria o Maven Central inteiro de novo.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src

# -DskipTests é hoje inócuo: o projeto ainda não tem nenhum teste automatizado
# (`src/test` está vazio — ver docs/DEPLOY_PROGRESS.md). A flag fica porque, quando existirem,
# o build de deploy não é o lugar para descobrir que quebraram: isso pertence a um passo de CI,
# antes do merge. Se um dia a suíte rodar aqui, cada push passa a esperar por ela.
RUN mvn -B clean package -DskipTests

# ---------------------------------------------------------------------------------------------
# Etapa 2 — runtime
# ---------------------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runtime

# Rodar como root dentro do contêiner é desnecessário: a aplicação só precisa ler o próprio .jar
# e abrir uma porta alta.
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# `catalogo.jar` vem do <finalName>catalogo</finalName> do pom.xml.
COPY --from=build /build/target/catalogo.jar app.jar

RUN chown -R spring:spring /app
USER spring

# A Railway injeta PORT no ambiente e o application.yml já lê ${PORT:8080}. O EXPOSE aqui é
# apenas documentação — não é ele que decide a porta.
EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod

# MaxRAMPercentage em vez de -Xmx fixo: o contêiner pode ter memória diferente conforme o plano
# da hospedagem, e a JVM sozinha assume um limite conservador demais.
ENTRYPOINT ["sh", "-c", "exec java -XX:MaxRAMPercentage=75 -XX:+UseSerialGC -jar /app/app.jar"]
