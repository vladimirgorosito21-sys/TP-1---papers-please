/* =====================================================================
   PAPERS, PLEASE — Historia interactiva
   ---------------------------------------------------------------------
   Todo el contenido de la historia vive acá. Cada "pasaje" es un
   cuadradito del diagrama de flujo.

   type:     "inicio" | "situacion" | "final" | "info"
   day:      número de día que se muestra en la barra de estado
   credits:  cuánto cambia el dinero al ENTRAR a este pasaje
   text:     lista de párrafos (acepta HTML simple: <em>, <strong>)
   info:     ids de pasajes tipo "info" (los azules) que se pueden leer
   choices:  decisiones (los verdes) -> { label, to }
   final:    { n, good } solo para pasajes tipo "final"
   video:    ID de YouTube (11 caracteres, ej. "dQw4w9WgXcQ") o ruta a un
             .mp4 local. Se incrusta en la pantalla del final.
   ===================================================================== */

const STORY = {
  start: "inicio",
  totalEndings: 7,

  passages: {

    /* ------------------------------------------------------------ */
    /*  INICIO                                                       */
    /* ------------------------------------------------------------ */

    inicio: {
      type: "inicio",
      title: "Gloria a Arstotzka",
      text: [
        "Noviembre de 1982. La guerra de seis años contra Kolechia terminó y la ciudad fronteriza de Grestín volvió a abrirse. El Ministerio de Admisión anuncia la apertura de un nuevo puesto de control en Grestín Oriental.",
        "Vos sos uno más entre los miles de ciudadanos que esperan que la lotería laboral les cambie la vida. Tenés una esposa, un hijo, una suegra y un tío que dependen de lo que traigas a casa.",
        "Cada decisión que tomes en esta historia te acerca a uno de <strong>siete finales</strong>. Solo uno de ellos es bueno."
      ],
      choices: [
        { label: "Comenzar", to: "grestin" }
      ]
    },

    /* ------------------------------------------------------------ */
    /*  SITUACIONES — antes del trabajo                              */
    /* ------------------------------------------------------------ */

    grestin: {
      type: "situacion",
      title: "Grestín Oriental",
      text: [
        "Grestín es una ciudad partida al medio. De un lado, Grestín Occidental, bajo bandera kolechia. Del otro, Grestín Oriental, arstotzkano hasta el último ladrillo. Entre ambos, un muro de hormigón levantado en 1976 que todavía huele a pólvora.",
        "Vivís en un departamento clase 8 del bloque obrero N.º 14: dos ambientes, una estufa a carbón que funciona cuando quiere y una ventana que da al muro. La ración estatal alcanza para poco. El invierno se acerca.",
        "En el cartel del Ministerio de Trabajo, pegado sobre el afiche descolorido de la última campaña, se lee: <em>«LOTERÍA LABORAL DE OCTUBRE — GLORIA A ARSTOTZKA»</em>."
      ],
      info: ["arstotzka", "guerra_civil", "banderines"],
      choices: [
        { label: "Buscar trabajo", to: "trabajo" }
      ]
    },

    trabajo: {
      type: "situacion",
      title: "Encontrar trabajo",
      text: [
        "La fábrica textil cerró en primavera. La mina de Kolechia ya no toma arstotzkanos. En la oficina de empleo, una funcionaria con un sello en cada mano te lee las opciones disponibles: obrero de mantenimiento del muro, operario de la planta de carbón o… inspector de inmigración.",
        "«El Ministerio de Admisión abre el puesto de control de Grestín el 23 de noviembre», dice sin levantar la vista. «Sueldo por persona procesada. Vivienda asignada. Solo se admiten solicitudes de ciudadanos con expediente limpio.»",
        "Tu expediente está limpio. Más o menos."
      ],
      choices: [
        { label: "Enviar la solicitud", to: "solicitud" }
      ]
    },

    solicitud: {
      type: "situacion",
      title: "Enviar solicitud",
      text: [
        "Formulario M-27, tres copias. Nombre, número de identificación, distrito, antecedentes de servicio militar, parentesco con extranjeros (<em>ninguno</em>, escribís, aunque tu tío nació en Kolechia antes de la partición).",
        "Hacés la fila durante cuatro horas. Al final, un sello rojo: RECIBIDO. Nada más.",
        "Pasan tres semanas. El carbón se termina. Tu hijo empieza a toser."
      ],
      choices: [
        { label: "Esperar la respuesta", to: "elegido" }
      ]
    },

    elegido: {
      type: "situacion",
      title: "Elegido para trabajar",
      text: [
        "Una carta oficial con el escudo del Ministerio de Admisión:",
        "<q>Felicitaciones. Su nombre ha sido seleccionado en la lotería laboral de octubre. Preséntese el día 23 de noviembre a las 06:00 en el puesto de control de Grestín Oriental. Se le ha asignado un departamento clase 8 en el sector residencial del puesto. La familia inmediata puede acompañarlo. Gloria a Arstotzka.</q>",
        "Tu esposa llora. Tu suegra dice que es una trampa. Tu tío no dice nada, pero guarda la carta en el bolsillo de la campera como si fuera un pasaporte.",
        "Mañana es 23 de noviembre."
      ],
      choices: [
        { label: "Ir a trabajar", to: "dia1" },
        { label: "No ir a trabajar", to: "final1" }
      ]
    },

    /* ------------------------------------------------------------ */
    /*  DÍAS 1 A 4 — tronco común                                    */
    /* ------------------------------------------------------------ */

    dia1: {
      type: "situacion",
      title: "Día 1 en la aduana de Grestín Oriental",
      day: 1,
      credits: 15,
      text: [
        "23 de noviembre de 1982. La cabina huele a pintura fresca. Frente a vos: una ventanilla, un micrófono, dos sellos (APROBADO, DENEGADO) y un manual de normas de trescientas páginas que nadie va a leer completo.",
        "Por altoparlante: «Hoy solo se permite el ingreso de ciudadanos arstotzkanos. Revise que el pasaporte sea válido y esté vigente.»",
        "Pasan doce personas. Un hombre con el pasaporte vencido te ruega que lo dejes pasar: su madre está del otro lado del muro. Lo denegás. Es la norma.",
        "Al cierre: 12 personas procesadas, 60 créditos. Alquiler, 20. Calefacción, 10. Comida, 15. Quedan 15."
      ],
      choices: [
        { label: "Cerrar la cabina", to: "dia2" }
      ]
    },

    dia2: {
      type: "situacion",
      title: "Día 2 en la aduana de Grestín Oriental",
      day: 2,
      credits: 5,
      text: [
        "Nueva directiva: se permite el ingreso de extranjeros con pasaporte válido. Los kolechios necesitan, además, un permiso especial.",
        "La fila es más larga. Una mujer de Antegria discute cuando le pedís el permiso. Un anciano de Impor tiene la foto del pasaporte tan vieja que podría ser su hijo. Sellás, sellás, sellás.",
        "Un hombre alto, con un sombrero que le tapa la mitad de la cara, se acerca a la ventanilla sin documentos. «No vengo a pasar», dice. «Vengo a que me recuerdes.» Antes de que puedas llamar a los guardias, se va.",
        "Al cierre: 15 procesadas, 75 créditos. Tu suegra tiene fiebre. Medicina: 30."
      ],
      choices: [
        { label: "Cerrar la cabina", to: "dia3" }
      ]
    },

    dia3: {
      type: "situacion",
      title: "Día 3 en la aduana de Grestín Oriental",
      day: 3,
      credits: 10,
      text: [
        "Tercera directiva en tres días: todo extranjero necesita ahora un permiso de entrada emitido por el Ministerio, con nombre, fecha y propósito de la visita. Los ciudadanos deben mostrar el suplemento de identidad.",
        "El trabajo se vuelve lento. Cada persona son tres documentos, cuatro campos que comparar, un sello. Cometés dos errores: uno perdonado, uno con advertencia. Un tercero sería multa.",
        "Entre los papeles de la última persona del día encontrás un sobre sin remitente. Adentro, una hoja con una estrella de cinco puntas dibujada a mano y una frase:",
        "<q>Mañana vendrá uno de los nuestros. Su pasaporte no será perfecto. Déjelo pasar y hablaremos de su futuro. — La Orden de la Estrella de EZIC.</q>"
      ],
      info: ["ezic"],
      choices: [
        { label: "Guardar el sobre y cerrar", to: "dia4" }
      ]
    },

    dia4: {
      type: "situacion",
      title: "Día 4 en la aduana de Grestín Oriental",
      day: 4,
      credits: 10,
      text: [
        "Estás distinto hoy. Mirás cada cara buscando una estrella.",
        "A media mañana llega. Un hombre de unos cuarenta años, pasaporte de la Federación Unida, pelo gris, abrigo largo. En el permiso de entrada, la fecha de expedición no coincide con el sello. Es un error pequeño. Un inspector distraído no lo vería.",
        "Sobre el mostrador, apenas visible, apoya un papel doblado con una estrella de cinco puntas. Te mira. No dice nada.",
        "El sello APROBADO está a la derecha. El DENEGADO, a la izquierda. Los guardias esperan tu decisión."
      ],
      info: ["ezic"],
      choices: [
        { label: "No dejar pasar al agente de EZIC", to: "dia5" },
        { label: "Dejar pasar al agente de EZIC", to: "ezic_dinero" }
      ]
    },

    /* ------------------------------------------------------------ */
    /*  RAMA A — rechazaste a EZIC (días 5 a 8)                       */
    /* ------------------------------------------------------------ */

    dia5: {
      type: "situacion",
      title: "Día 5 en la aduana de Grestín Oriental",
      day: 5,
      credits: 15,
      text: [
        "DENEGADO. El hombre de la Federación Unida recoge su pasaporte sin decir palabra. Al irse, el papel con la estrella queda sobre el mostrador. Lo tirás.",
        "Día 5: nuevo reglamento, revisar peso y altura declarados en el suplemento de identidad. Un contrabandista con doce kilos de más en la ropa termina en detención. Bonificación: 5 créditos.",
        "En la fila nadie tiene estrellas. Solo frío."
      ],
      choices: [
        { label: "Cerrar la cabina", to: "dia6" }
      ]
    },

    dia6: {
      type: "situacion",
      title: "Día 6 en la aduana de Grestín Oriental",
      day: 6,
      credits: -20,
      text: [
        "Los mineros kolechios necesitan ahora permiso laboral. La mitad no lo tiene. Cerrás la ventanilla en la cara de un hombre que jura que su familia se muere de hambre en Grestín Occidental.",
        "Tu tío se enferma. El médico del puesto cobra 30 créditos. Pagás.",
        "Nadie de EZIC vuelve a escribirte. Es un alivio o una amenaza; todavía no sabés cuál."
      ],
      choices: [
        { label: "Cerrar la cabina", to: "dia7" }
      ]
    },

    dia7: {
      type: "situacion",
      title: "Día 7 en la aduana de Grestín Oriental",
      day: 7,
      credits: 15,
      text: [
        "Un diplomático de Antegria cruza a las 11:00 con toda la documentación en regla. Detrás de él, un hombre salta la barrera. Los guardias lo reducen antes de que llegue a la cabina. Tenía una estrella tatuada en la muñeca.",
        "«Ese venía por vos», dice un guardia, casi en broma. Nadie se ríe.",
        "A la noche, el Ministerio te envía una carta: <em>«Su historial de decisiones es ejemplar. Manténgalo así.»</em>"
      ],
      choices: [
        { label: "Cerrar la cabina", to: "dia8" }
      ]
    },

    dia8: {
      type: "situacion",
      title: "Día 8 en la aduana de Grestín Oriental (Polio)",
      day: 8,
      credits: 0,
      text: [
        "Brote de poliomielitis en Grestín Occidental. Directiva urgente: nadie ingresa sin certificado de vacunación vigente.",
        "A las 14:00, una madre con dos hijos. Certificados en regla, salvo el del menor: la fecha está borroneada. Podría ser de este año o del anterior. La mujer llora. Sellás APROBADO.",
        "A las 17:00, una citación oficial: <em>«Ingreso indebido de persona sin certificado válido. Multa: 50 créditos. El pago cierra el expediente. El impago abre una investigación.»</em>",
        "Cincuenta créditos es todo lo que tenés."
      ],
      choices: [
        { label: "Pagar la multa", to: "final4" },
        { label: "No pagar la multa", to: "final5" }
      ]
    },

    /* ------------------------------------------------------------ */
    /*  RAMA B — dejaste pasar a EZIC                                 */
    /* ------------------------------------------------------------ */

    ezic_dinero: {
      type: "situacion",
      title: "EZIC te ha dado dinero",
      day: 4,
      credits: 1000,
      text: [
        "APROBADO. El hombre cruza sin mirar atrás. A la noche, al cerrar la cabina, encontrás un sobre debajo del manual de normas. Adentro: 1000 créditos en billetes usados y una nota.",
        "<q>La Orden agradece. Esto es solo el comienzo. Arstotzka va a cambiar, con o sin vos. Mejor con vos.</q>",
        "Mil créditos son diez meses de alquiler. Son medicina para tu suegra, carbón hasta la primavera, un abrigo nuevo para tu hijo.",
        "También son diez años de prisión si el Ministerio de Información los encuentra."
      ],
      info: ["ezic"],
      choices: [
        { label: "Quemar el dinero", to: "dia5_1" },
        { label: "Quedarte el dinero", to: "dia5_2" }
      ]
    },

    /* --- B.2: te quedaste el dinero ------------------------------- */

    dia5_2: {
      type: "situacion",
      title: "Día 5.2 en la aduana de Grestín Oriental",
      day: 5,
      credits: -300,
      text: [
        "Guardás el dinero en la pared, detrás del calefactor. A la mañana pagás el alquiler atrasado, comprás medicina y un abrigo. Tu familia come carne por primera vez en un mes.",
        "En la aduana, el jefe de inspección te felicita por la productividad. Sonreís.",
        "A la tarde, un hombre con traje gris del Ministerio de Información entra a la cabina sin golpear. Pone una foto sobre el mostrador: vos, ayer, en la farmacia, pagando con un billete de 100.",
        "«Su sueldo neto de esta semana fue de 45 créditos, inspector. Explíqueme esto.»"
      ],
      choices: [
        { label: "No hay nada que explicar", to: "final2" }
      ]
    },

    /* --- B.1: quemaste el dinero ---------------------------------- */

    dia5_1: {
      type: "situacion",
      title: "Día 5.1 en la aduana de Grestín Oriental",
      day: 5,
      credits: -985,
      text: [
        "Quemás los billetes en la estufa, uno por uno. Arden bien. Tu hijo pregunta qué es ese olor y le decís que es carbón húmedo.",
        "En la aduana, el día 5 trae un nuevo reglamento: revisar el peso y la altura en el suplemento de identidad. Un hombre con el peso mal declarado esconde un paquete bajo la ropa. Lo mandás a detención.",
        "Nadie de EZIC aparece. Pero en el sobre del sueldo hay una estrella dibujada con lápiz."
      ],
      choices: [
        { label: "Cerrar la cabina", to: "dia6_1" }
      ]
    },

    dia6_1: {
      type: "situacion",
      title: "Día 6.1 en la aduana de Grestín Oriental",
      day: 6,
      credits: 10,
      text: [
        "Reglamento nuevo: los trabajadores extranjeros necesitan permiso laboral. Un grupo de mineros kolechios se queda del otro lado del muro cuando les denegás la entrada.",
        "A la salida, el hombre del sombrero del segundo día te espera en la parada del tranvía. «Quemaste el dinero. Interesante. No importa: no te queríamos por el dinero. Te queríamos por la cabina.»",
        "«Pasado mañana va a cruzar un diplomático de Antegria. Lleva documentos que pueden derrumbar al Ministerio. No lo dejes pasar… o dejalo, y mirá lo que pasa.»",
        "No le respondés. Él tampoco esperaba respuesta."
      ],
      info: ["ezic"],
      choices: [
        { label: "Cerrar la cabina", to: "dia7_1" }
      ]
    },

    dia7_1: {
      type: "situacion",
      title: "Día 7.1: atentado de EZIC",
      day: 7,
      credits: 0,
      text: [
        "El diplomático llega a las 11:00. Autorización diplomática, pasaporte antegrio, un maletín. Los documentos están en orden.",
        "Detrás de él, en la fila, un hombre joven se abre paso a empujones. Salta la barrera. Tiene una granada en la mano izquierda y una estrella tatuada en la muñeca.",
        "Te tiran el rifle de tranquilizantes por la escotilla. Los guardias gritan. Tenés un solo disparo antes de que alguien mueva la mano.",
        "El terrorista de EZIC está a cinco metros. El diplomático antegrio, a dos. Y en ese segundo se te cruza una idea: si el diplomático cae, los documentos que lleva desaparecen, y EZIC quizás te deje en paz."
      ],
      choices: [
        { label: "Disparar al terrorista de EZIC", to: "dia8_1" },
        { label: "Disparar al diplomático antegrio", to: "final3" }
      ]
    },

    dia8_1: {
      type: "situacion",
      title: "Día 8.1 en la aduana de Grestín Oriental (Polio)",
      day: 8,
      credits: 70,
      text: [
        "El dardo entra en el hombro del terrorista. Cae antes de soltar la granada. Los guardias lo arrastran. El diplomático te mira, asiente y cruza. Nunca vas a saber qué llevaba en el maletín.",
        "Al día siguiente el Ministerio te entrega una mención por servicio… y una directiva nueva: brote de poliomielitis en Grestín Occidental. Todo ingresante necesita certificado de vacunación válido.",
        "La fila se llena de tos y de niños. Trabajás el doble revisando fechas de vacunas. No cometés un solo error.",
        "En el sobre del sueldo, además de los 70 créditos, hay una nota: <em>«Bien hecho. Ahora sí: hablemos de tu futuro.»</em>"
      ],
      choices: [
        { label: "Cerrar la cabina", to: "dia9" }
      ]
    },

    dia9: {
      type: "situacion",
      title: "Día 9: tramitar pasaporte a Obristán",
      day: 9,
      credits: 15,
      text: [
        "El hombre del sombrero se sienta enfrente en la fila, como un ingresante más. Desliza un pasaporte por la ranura. Es de Obristán. Tiene tu foto.",
        "«Es auténtico. Bueno, casi. La Orden consigue uno por colaborador. <strong>Uno.</strong> Al norte no hay muro, no hay Ministerio, no hay estrella. Solo nieve y silencio.»",
        "«Sellalo con tu propio sello y es tuyo. Cruzás el día 10 por la cabina de al lado y nadie te vuelve a ver.»",
        "«¿Y mi familia?», preguntás. Se encoge de hombros. «Dije uno.»"
      ],
      info: ["ezic"],
      choices: [
        { label: "Aceptar el trámite", to: "dia10_1" },
        { label: "No aceptar el trámite", to: "dia10" }
      ]
    },

    dia10_1: {
      type: "situacion",
      title: "Día 10.1 en la aduana de Grestín Oriental",
      day: 10,
      credits: 0,
      text: [
        "Sellás el pasaporte. APROBADO. Lo escondés en el forro del abrigo.",
        "Día 10. Llegás a la aduana a las 05:30, antes que todos. Dejás la cabina limpia, el manual cerrado, los sellos en su lugar. Sobre el mostrador, una nota para tu esposa que nunca vas a saber si leyó.",
        "A las 06:00 cruzás por la cabina 2, con documentos obristaníes en regla. Un inspector nuevo, que no sabe quién sos, te mira dos segundos y sella."
      ],
      choices: [
        { label: "Cruzar el muro", to: "final7" }
      ]
    },

    dia10: {
      type: "situacion",
      title: "Día 10: control del personal por sospecha",
      day: 10,
      credits: 0,
      text: [
        "Rompés el pasaporte en cuatro y lo tirás en la estufa junto con la nota. El hombre del sombrero no vuelve.",
        "Día 10. Antes de abrir la cabina, un altoparlante: <em>«TODOS LOS INSPECTORES DEBEN PRESENTARSE AL CONTROL DE PERSONAL. EL MINISTERIO DE INFORMACIÓN HA DETECTADO ACTIVIDAD SUBVERSIVA EN ESTE PUESTO.»</em>",
        "Los guardias forman una fila hasta la oficina de administración. Uno de ellos, el mismo que te tiró el rifle, no te mira a los ojos.",
        "Podrías correr. Pero ¿hacia dónde? Del otro lado hay un muro. De este lado, tu familia."
      ],
      choices: [
        { label: "Ir al control", to: "final6" }
      ]
    },

    /* ------------------------------------------------------------ */
    /*  FINALES                                                      */
    /* ------------------------------------------------------------ */

    final1: {
      type: "final",
      final: { n: 1, good: false },
      video: "4SXizuQizyo",  // https://youtu.be/4SXizuQizyo
      title: "Arrestado por faltar al servicio",
      text: [
        "No te presentás. Pensás que van a elegir a otro, que la lotería tiene miles de nombres.",
        "A las 09:40 golpean la puerta. Dos agentes del Ministerio de Información, con una copia de tu carta de asignación en la mano. «Rechazar un puesto asignado por el Estado es desertar del Estado.»",
        "Te llevan. La familia se queda en el bloque 14, sin carbón y sin vos. El puesto de control abre igual, con otro nombre en la cabina."
      ]
    },

    final2: {
      type: "final",
      final: { n: 2, good: false },
      video: "_Cz9n02dYEc",  // https://youtu.be/_Cz9n02dYEc
      title: "Arrestado por fondos ilícitos",
      text: [
        "Encuentran el sobre detrás del calefactor en menos de cinco minutos. El Ministerio de Información ya sabía dónde buscar: EZIC te vendió, o alguien de EZIC ya era del Ministerio.",
        "Cargos: posesión de fondos ilícitos, colaboración con organización subversiva, traición a la patria.",
        "Tu familia es reubicada. Vos, no."
      ]
    },

    final3: {
      type: "final",
      final: { n: 3, good: false },
      video: "bOn23UrG4Hk",  // https://youtu.be/bOn23UrG4Hk
      title: "Mataste al diplomático importante",
      text: [
        "Un rifle de tranquilizantes no deja en el piso a un hombre con el cuello quebrado, pero el diplomático de Antegria cae mal, muy mal, contra el borde del mostrador.",
        "El terrorista aprovecha el desconcierto y desaparece entre la multitud. La granada era falsa.",
        "Al día siguiente el diario titula: <em>«INSPECTOR ARSTOTZKANO MATA A EMBAJADOR DE ANTEGRIA»</em>. Antegria retira a su cuerpo diplomático. El Ministerio necesita un culpable y lo tiene sentado en la cabina 1.",
        "Te arrestan por homicidio e incidente diplomático. La historia no recuerda tu nombre, pero sí tu sello."
      ]
    },

    final4: {
      type: "final",
      final: { n: 4, good: true },
      video: "iqZgg8xo3yk",  // https://youtu.be/iqZgg8xo3yk
      title: "Condecorado por tu excelente servicio",
      text: [
        "Pagás. Cincuenta créditos, el expediente se cierra. Esa noche la familia cena pan y té. Nadie se queja.",
        "Al final del mes, el Ministerio de Admisión revisa los registros de todos los inspectores del puesto. Diez días, cero colaboraciones con EZIC, una sola infracción, pagada.",
        "Te condecoran con la Medalla al Servicio de Grestín. Sueldo fijo, departamento clase 6, vacuna para toda la familia.",
        "No cambiaste Arstotzka. Pero tu familia pasa el invierno, y en Grestín eso ya es una victoria.",
        "<strong>Gloria a Arstotzka.</strong>"
      ]
    },

    final5: {
      type: "final",
      final: { n: 5, good: false },
      video: "sA9qSeWfHZY",  // https://youtu.be/sA9qSeWfHZY
      title: "Arrestado por acelerar la epidemia de polio",
      text: [
        "No pagás. Pensás que una fecha borroneada no es culpa de nadie.",
        "Tres días después, el niño que dejaste pasar es el primer caso de polio confirmado en Grestín Oriental. Hay veinte más en una semana.",
        "El Ministerio necesita un responsable. Tiene el expediente abierto y tu firma en el sello.",
        "Te arrestan por «negligencia sanitaria agravada». Los diarios usan tu foto."
      ]
    },

    final6: {
      type: "final",
      final: { n: 6, good: false },
      video: "f3LAdyJFOOo",  // https://youtu.be/f3LAdyJFOOo
      title: "Preso por colaborar con EZIC",
      text: [
        "En la oficina te esperan con una carpeta. Adentro: la nota del día 3, una foto tuya con el hombre del sombrero en la parada del tranvía y una declaración firmada por el terrorista que dormiste el día 7.",
        "«Usted quemó el dinero, inspector. Lo sabemos. También sabemos que no informó nada de esto. En Arstotzka, callar es colaborar.»",
        "Te arrestan por colaboración con EZIC. El puesto abre a las 06:00 con otro inspector. La fila es la misma de siempre."
      ]
    },

    final7: {
      type: "final",
      final: { n: 7, good: false },
      video: "emxFBKFHag0",  // https://youtu.be/emxFBKFHag0
      title: "Huir a Obristán solo, sin familia",
      text: [
        "Del otro lado del muro empieza la ruta al norte. Diez días a pie hasta la frontera obristaní, después nieve, después nada.",
        "Nunca volvés a Arstotzka. Tu familia es interrogada, reubicada y olvidada. Vos también, pero en otro país.",
        "Sobreviviste. Es lo único que se puede decir."
      ]
    },

    /* ------------------------------------------------------------ */
    /*  INFO / CONTEXTO (los azules — contenido inventado)           */
    /* ------------------------------------------------------------ */

    arstotzka: {
      type: "info",
      title: "Arstotzka",
      text: [
        "<strong>Nombre oficial:</strong> República Popular de Arstotzka. <strong>Capital:</strong> Altan. <strong>Ciudades principales:</strong> Vescillo, Orvech Vonor, Paradizna, Grestín Oriental. <strong>Moneda:</strong> crédito.",
        "Estado de partido único desde el Consejo de 1949. El Ministerio de Admisión controla las fronteras; el Ministerio de Información controla todo lo demás.",
        "Limita al oeste con Kolechia, al norte con Obristán y al este con el Mar Interior. Al sur, la cordillera de Vescillo la separa de Antegria e Impor. Más lejos, Republia y la Federación Unida, con quienes mantiene relaciones «cordiales pero vigiladas».",
        "Lema: <em>«Gloria a Arstotzka»</em>. Se dice al entrar, al salir y, según el manual, también al pensar."
      ]
    },

    guerra_civil: {
      type: "info",
      title: "Guerra Civil de Arstotzka (1946–1949)",
      text: [
        "Tras la retirada de las potencias que ocuparon la región durante la Gran Guerra, Arstotzka quedó dividida entre dos facciones: los <strong>Unionistas</strong>, apoyados por Kolechia, que querían una federación con los países vecinos, y el <strong>Consejo Popular</strong>, que quería un Estado cerrado y autosuficiente.",
        "Tres años de combates en la cordillera de Vescillo. La batalla decisiva fue la de Orvech Vonor, en el invierno de 1949, cuando los unionistas quedaron sin suministros porque Kolechia cerró la frontera de Grestín.",
        "El Consejo Popular ganó y fundó el Estado actual. El Ministerio de Información nació esa misma semana. Los unionistas que sobrevivieron cruzaron a Kolechia… o se quedaron, callados, con los papeles en regla."
      ]
    },

    banderines: {
      type: "info",
      title: "Guerra de los Banderines (1976)",
      text: [
        "Antes del muro, la frontera entre Grestín Oriental y Occidental estaba marcada por banderines de tela clavados en el suelo: rojos para Arstotzka, azules para Kolechia. Cada mañana, una patrulla de cada lado recorría la línea y contaba los banderines.",
        "En marzo de 1976, una patrulla arstotzkana descubrió que los banderines habían sido corridos doce metros hacia el este durante la noche. Los corrieron de vuelta veinte. Al día siguiente, Kolechia los movió treinta. En dos semanas, la «línea» se había desplazado seis veces y había atravesado tres casas y una panadería.",
        "El 2 de abril, un soldado kolechio disparó a un arstotzkano que clavaba un banderín en su propio patio. El incidente se convirtió en la guerra de seis años.",
        "El muro se construyó ese mismo invierno, sobre la línea original. Los banderines siguen guardados en el Museo de Grestín. Ninguno de los dos países reconoce quién movió el primero."
      ]
    },

    ezic: {
      type: "info",
      title: "La Orden de la Estrella de EZIC",
      text: [
        "Organización clandestina que opera en Arstotzka y países vecinos. Su símbolo es una estrella de cinco puntas dibujada a mano. Su objetivo declarado: «liberar a Arstotzka de su gobierno». Su método: infiltrar agentes a través de los puestos de control.",
        "Nadie sabe quién la dirige. El Ministerio de Información dice que EZIC no existe. El Ministerio de Admisión dice que la busca. Los inspectores dicen que aparece cuando uno menos lo espera, con un sobre y una promesa.",
        "Lo que se sabe: EZIC paga bien, EZIC vigila y EZIC no acepta un «no»."
      ]
    }
  }
};
