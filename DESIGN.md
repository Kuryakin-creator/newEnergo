# DESIGN.md — ЭнергоГрупп

Этот файл определяет визуальный язык корпоративного сайта **ЭнергоГрупп**.

Читай его перед:

* созданием новой страницы;
* созданием новой секции;
* существенным redesign;
* изменением hero;
* изменением композиции;
* существенной typography work;
* изменением visual hierarchy;
* разработкой новой animation system или визуального interaction.

Не требуется читать его для мелких невизуальных правок.

---

# 1. DESIGN INTENT

Сайт должен восприниматься как цифровое присутствие крупной инженерно-строительной компании федерального уровня.

Визуально он должен передавать:

**масштаб + инженерную компетентность + технологичность + надёжность + серьёзность бизнеса.**

Это не SaaS.

Это не startup landing page.

Это не каталог карточек.

Это не типовой шаблон строительной компании.

---

# 2. PRIMARY VISUAL REFERENCE

Главный внешний visual reference:

https://octobergroup.ru/

Используй October Group только как ориентир по:

* visual rhythm;
* composition;
* typography hierarchy;
* headline scale;
* whitespace;
* asymmetry;
* image/text relationships;
* presentation of projects;
* presentation of numbers;
* premium corporate restraint.

Не копируй:

* source code;
* exact layout;
* branding;
* colors;
* logos;
* copy;
* images;
* exact animations;
* exact compositions.

Нужно перенимать **принцип арт-дирекшена**, а не воспроизводить сайт.

Не открывай reference для каждой маленькой задачи.

Используй его, когда реально проектируется visual composition.

Если пользователь приложил конкретный screenshot/reference — он имеет приоритет.

---

# 3. ART DIRECTION BEFORE CODE

Для существенной новой композиции перед реализацией мысленно определи:

### Thesis

Одна фраза:

> Как визуальная идея связана с конкретной задачей этой секции?

### System

Определи:

* typography roles;
* scale;
* spacing;
* grid/layout principle;
* accent usage;
* image treatment.

### Signature

Найди один запоминающийся элемент, который связан именно с инженерно-строительной тематикой или контентом ЭнергоГрупп.

Это может быть:

* масштаб;
* геометрия инфраструктуры;
* инженерная сетка;
* линия маршрута;
* структура объекта;
* крупная фактическая цифра;
* нестандартное взаимодействие текста и изображения.

Не добавляй signature ради декора.

### Restraint

Определи, где дизайн должен быть намеренно спокойным.

Не каждая секция должна конкурировать за внимание.

---

# 4. ANTI-GENERIC TEST

После формирования композиции проведи **subject-swap test**:

> Если заменить «ЭнергоГрупп» на компанию из совершенно другой отрасли и дизайн всё ещё выглядит одинаково уместным — решение слишком шаблонное.

Исправь наиболее generic часть.

Проведи также **brand test**:

> Если убрать navigation/logo и первый экран легко принять за сайт любой другой строительной компании — визуальная идентичность слишком слабая.

---

# 5. FIRST VIEWPORT

Первый экран должен восприниматься как **одна композиция**, а не как набор widgets.

Обычно достаточно:

* brand signal;
* одного сильного headline;
* короткого supporting statement;
* основного visual;
* CTA, если он действительно нужен.

Не перегружай hero:

* статистическими strips;
* большим количеством badges;
* множеством карточек;
* длинными списками;
* floating labels;
* вторичными promo blocks;
* несколькими конкурирующими headline.

Hero должен быстро отвечать:

1. кто это;
2. какого масштаба компания;
3. чем она занимается;
4. какое впечатление должна оставить.

---

# 6. COMPOSITION

Каждая секция должна иметь **одну главную задачу**.

Visual hierarchy:

1. identifier / eyebrow — если нужен;
2. headline;
3. ключевой тезис;
4. supporting information;
5. visual / metric / project / evidence.

Не пытайся одинаково выделить всё.

Разрешены:

* asymmetry;
* offset alignment;
* controlled overlap;
* unexpected whitespace;
* крупный масштаб;
* различная вертикальная плотность.

Элементы не обязаны выстраиваться в идеально одинаковые ряды.

---

# 7. PAGE RHYTHM

Не строй страницу как:

`card → card → card → card → card`

Чередуй плотность.

Например:

* image-led section;
* text-led section;
* large metric;
* competence list;
* project;
* full-width visual;
* quiet whitespace section.

После визуально насыщенной секции желательно дать спокойную.

Не повторяй одинаковую композицию несколько секций подряд.

---

# 8. TYPOGRAPHY

Typography — основной элемент арт-дирекшена.

Используй выраженный scale contrast.

Headline, body, utility text и numeric data должны иметь разные роли.

Не делай одинаковыми по визуальному весу:

* headings;
* paragraphs;
* captions;
* metrics;
* navigation;
* labels.

Контролируй:

* line length;
* line breaks;
* line-height;
* letter-spacing;
* hierarchy;
* whitespace.

Не используй неконтролируемый:

`font-size: vw`

Для fluid scale используй `clamp()` только когда он реально нужен.

Не ломай существующую font system ради novelty.

Если в проекте уже есть подходящие fonts — используй их.

---

# 9. CONTENT WIDTH

Не растягивай обычные paragraphs на всю ширину desktop.

Текст должен сохранять читаемую measure.

Большая ширина допустима для:

* display headline;
* numbers;
* short thesis;
* labels;
* visual typography.

Но не для длинного body copy.

---

# 10. COLOR

Сохраняй фирменную палитру ЭнергоГрупп.

October Group не является color reference.

Используй фирменный цвет как **акцент**, а не как обязательную заливку каждого блока.

Создавай нейтральные пространства.

Цвет должен:

* задавать hierarchy;
* выделять action;
* показывать relationship;
* поддерживать brand.

Не использовать цвет просто для заполнения пустоты.

---

# 11. IMAGERY

Приоритет:

1. реальные объекты ЭнергоГрупп;
2. реальные строительные процессы;
3. инфраструктура;
4. техника;
5. монтаж;
6. специалисты;
7. relevant architectural/industrial details.

Предпочтительны:

* ЛЭП;
* подстанции;
* кабельные трассы;
* монтаж;
* промышленная инфраструктура;
* строительная техника;
* инженерные объекты.

Не используй бессмысленный generic stock.

Не создавай декоративные AI-images без прямой необходимости.

Изображение должно объяснять или усиливать содержание секции.

---

# 12. IMAGE TREATMENT

Не помещай каждое изображение автоматически в:

* rounded card;
* floating box;
* bordered frame.

Для marketing/corporate surfaces крупное изображение часто лучше воспринимается как:

* full bleed;
* edge aligned;
* architectural crop;
* large visual plane.

Crop должен быть намеренным.

Следи, чтобы ключевой объект не обрезался случайно на mobile.

---

# 13. CARDS

Default:

> **Не использовать card, если она ничего не структурирует.**

Карточка оправдана для повторяемых или интерактивных сущностей:

* проектов;
* новостей;
* сотрудников;
* документов;
* направлений;
* interactive item.

Не превращай обычный paragraph в card ради оформления.

Не используй:

`card inside card`

Если убрать:

* border;
* shadow;
* radius;
* background,

и смысл не изменится — скорее всего card не нужна.

---

# 14. EFFECTS

Используй сдержанно:

* shadows;
* gradients;
* blur;
* glow;
* border-radius;
* glassmorphism;
* decorative blobs;
* pills;
* floating containers.

ЭнергоГрупп должен выглядеть premium через:

* пропорции;
* typography;
* photography;
* scale;
* spacing;
* composition,

а не через количество эффектов.

---

# 15. MOTION

Motion должен создавать:

* hierarchy;
* continuity;
* spatial understanding;
* emphasis;
* presence.

Не создавать шум.

Если animation уже существует — по умолчанию сохраняй её систему.

Не подключай новую animation library ради одной секции.

Предпочитай анимировать:

* `transform`;
* `opacity`;

вместо дорогих layout properties, если это позволяет эффект.

Не анимируй всё одновременно.

Существенные motion effects должны сохранять понятность интерфейса при `prefers-reduced-motion`.

---

# 16. NUMBERS

ЭнергоГрупп имеет фактические показатели — используй их как часть дизайна.

Хорошая структура:

**крупная цифра**
короткая единица / подпись
одно объяснение значения.

Не превращай numbers в одинаковую полосу из 6 маленьких stat cards, если композиция позволяет выразить масштаб лучше.

Цифра должна работать как visual anchor.

---

# 17. PROJECTS

Проекты — один из главных доказательных элементов сайта.

Показывай:

* объект;
* отрасль;
* выполненную работу;
* масштаб;
* relevant result;
* фотографию.

Проект не должен выглядеть как generic blog card.

При возможности используй более editorial presentation:

* крупный visual;
* номер;
* location;
* project type;
* concise factual description.

---

# 18. COPY

Tone of voice:

**инженерный + уверенный + лаконичный + фактический.**

Приоритет:

> **факт → доказательство → компетенция → рекламное утверждение**

Хорошо:

> Более 120 км построенных кабельных линий.

Хуже:

> Мы обладаем огромным опытом и всегда обеспечиваем высочайшее качество.

Не используй marketing filler:

* «динамично развивающаяся компания»;
* «индивидуальный подход»;
* «команда профессионалов»;
* «широкий спектр услуг»;
* «качество, проверенное временем»;
* аналогичные клише.

Если утверждение можно заменить реальным фактом или цифрой — используй факт.

---

# 19. CONTENT HIERARCHY

Предпочтительная структура коммуникации:

**крупный короткий тезис**
↓
короткое пояснение
↓
цифра / объект / факт / доказательство

Не создавай длинные marketing paragraphs там, где можно показать информацию визуально.

---

# 20. RESPONSIVE DESIGN

Responsive — не отдельная уменьшенная копия desktop.

Сохраняй:

* hierarchy;
* reading order;
* usable spacing;
* readable typography;
* intentional image crop.

На mobile:

* убирай декоративную сложность раньше смысловой;
* не допускай horizontal overflow;
* не создавай микроскопический text;
* не допускай overlap;
* сохраняй достаточные touch targets.

Breakpoints должны следовать content constraints и существующей системе проекта.

---

# 21. INTERACTION

Interactive element должен визуально сообщать своё назначение.

Сохраняй:

* keyboard operation;
* visible focus;
* hover state, где применимо;
* accessible labels;
* корректные semantic controls.

Не используй unfamiliar icon-only control без понятного accessible name.

На мобильных устройствах interactive target должен оставаться удобным для касания.

---

# 22. DESIGN SYSTEM

Перед созданием нового:

* color;
* spacing value;
* button;
* card;
* heading style;
* component;
* animation primitive;

проверь, существует ли уже соответствующий token или pattern.

Не создавай параллельную design system внутри одной новой секции.

Если существующая система подходит — используй её.

---

# 23. ANTI-PATTERNS

Избегай типичного AI-generated web design:

* одинаковые rounded cards в каждой секции;
* excessive pill badges;
* arbitrary gradients;
* purple SaaS aesthetic;
* giant centered headline + three cards как универсальный hero;
* floating glass panels;
* декоративные blobs;
* одинаковые icon circles;
* бессмысленные stat strips;
* искусственная symmetry;
* excessive shadow;
* вложенные cards;
* слишком много competing CTAs;
* placeholder-style copy;
* случайные animations.

Каждый visual device должен иметь функцию.

---

# 24. DESIGN DECISION TEST

Перед добавлением элемента спроси:

> Что этот элемент делает для hierarchy, meaning, interaction или brand?

Если ответ:

> «просто выглядит интереснее»

— этого обычно недостаточно.

---

# 25. VISUAL VERIFICATION

Для существенной design-задачи при доступном browser/rendering:

проверь реализованный результат, а не только source code.

Оцени:

* hierarchy;
* composition;
* line breaks;
* whitespace;
* image crop;
* overflow;
* overlap;
* contrast;
* visual balance;
* interactive states;
* motion;
* mobile/desktop behavior в scope задачи.

Обычно достаточно:

* одного relevant desktop viewport;
* одного relevant mobile viewport, если responsive мог измениться.

Не выполняй бесконечные cosmetic iterations.

Один основной pass.

Если найден конкретный defect:

1. исправь;
2. один targeted re-check;
3. закончи.

---

# 26. FINAL STANDARD

Хороший результат для ЭнергоГрупп должен выглядеть:

* уверенно;
* масштабно;
* инженерно;
* современно;
* дорого;
* спокойно;
* фактически;
* не шаблонно.

Premium не означает «больше эффектов».

Premium здесь означает:

> **сильная композиция + качественная typography + реальный контент + масштаб + дисциплина.**
