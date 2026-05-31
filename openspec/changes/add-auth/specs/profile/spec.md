## ADDED Requirements

### Requirement: Creación automática de perfil

El sistema SHALL crear un registro `profile` asociado a cada `user` en el momento de su
registro, sea por email/contraseña o por OAuth.

#### Scenario: Perfil creado al registrarse

- **WHEN** se crea una nueva cuenta de usuario por cualquier método
- **THEN** el sistema crea un `profile` vinculado a ese usuario mediante `user.id`

#### Scenario: Relación uno a uno

- **WHEN** existe un usuario en el sistema
- **THEN** le corresponde exactamente un `profile`

### Requirement: Visualización del perfil propio

El sistema SHALL permitir que un usuario autenticado vea los datos de su propio perfil en
`/perfil`.

#### Scenario: Ver perfil autenticado

- **WHEN** un usuario autenticado accede a `/perfil`
- **THEN** el sistema muestra los datos de su cuenta (al menos nombre y email)

#### Scenario: Aislamiento de datos

- **WHEN** un usuario autenticado accede a `/perfil`
- **THEN** el sistema muestra únicamente su propio perfil y no el de otros usuarios
