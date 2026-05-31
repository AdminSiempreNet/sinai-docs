## ADDED Requirements

### Requirement: Registro con email y contraseña

El sistema SHALL permitir que una persona cree una cuenta con email y contraseña.

#### Scenario: Registro exitoso

- **WHEN** una persona envía un email no registrado y una contraseña válida
- **THEN** el sistema crea un registro `user` y su `profile` asociado
- **AND** inicia una sesión autenticada para esa persona

#### Scenario: Email ya registrado

- **WHEN** una persona intenta registrarse con un email que ya existe
- **THEN** el sistema rechaza el registro
- **AND** muestra un mensaje indicando que el email ya está en uso

### Requirement: Inicio de sesión con email y contraseña

El sistema SHALL permitir que un usuario registrado inicie sesión con su email y contraseña.

#### Scenario: Credenciales válidas

- **WHEN** un usuario envía email y contraseña correctos
- **THEN** el sistema establece una sesión autenticada
- **AND** redirige a la página de perfil

#### Scenario: Credenciales inválidas

- **WHEN** un usuario envía email o contraseña incorrectos
- **THEN** el sistema no establece sesión
- **AND** muestra un mensaje de error genérico sin revelar cuál dato falló

### Requirement: Inicio de sesión con OAuth

El sistema SHALL permitir iniciar sesión o registrarse mediante proveedores OAuth de Google y
Facebook.

#### Scenario: Autenticación con Google

- **WHEN** una persona elige continuar con Google y autoriza el acceso
- **THEN** el sistema crea o vincula la cuenta correspondiente y su `profile`
- **AND** establece una sesión autenticada

#### Scenario: Autenticación con Facebook

- **WHEN** una persona elige continuar con Facebook y autoriza el acceso
- **THEN** el sistema crea o vincula la cuenta correspondiente y su `profile`
- **AND** establece una sesión autenticada

### Requirement: Cierre de sesión

El sistema SHALL permitir que un usuario autenticado cierre su sesión.

#### Scenario: Logout

- **WHEN** un usuario autenticado solicita cerrar sesión
- **THEN** el sistema invalida la sesión actual
- **AND** el estado de la interfaz refleja que ya no hay sesión activa

### Requirement: Persistencia de sesión

El sistema SHALL mantener la sesión del usuario entre peticiones mediante cookies.

#### Scenario: Sesión activa entre navegaciones

- **WHEN** un usuario autenticado navega a otra página del sitio
- **THEN** el sistema reconoce su sesión sin pedir credenciales nuevamente

### Requirement: Protección de rutas privadas

El sistema SHALL restringir el acceso a `/perfil` a usuarios autenticados.

#### Scenario: Acceso sin sesión

- **WHEN** una persona sin sesión intenta acceder a `/perfil`
- **THEN** el sistema la redirige a la página de inicio de sesión

#### Scenario: Acceso con sesión

- **WHEN** un usuario autenticado accede a `/perfil`
- **THEN** el sistema muestra el contenido del perfil

### Requirement: La documentación permanece pública

El sistema SHALL mantener accesible la documentación sin requerir autenticación.

#### Scenario: Lectura de docs sin sesión

- **WHEN** una persona sin sesión visita una página de documentación
- **THEN** el sistema muestra el contenido sin redirigir a login
