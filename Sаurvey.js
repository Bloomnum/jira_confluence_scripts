<button type="button" id="butform">Загрузить опрос</button>

<script>
  // Выполняем GET-запрос для переключения пользователя на bot
  fetch("https://your_confluence.com/rest/scriptrunner/latest/custom/switch_User_bot", {
    method: "GET",
    credentials: 'include'
  })
    .then(response => response.text())
    .then(result => {
      alert("Пользователь переключен на bot: " + result);
    })
    .catch(error => {
      alert("Ошибка переключения пользователя: " + error);
    });

  // Получаем ID текущей страницы
  // <meta name="ajs-page-id" content="123456">
  const existingPageId = document.querySelector("meta[name='ajs-page-id']").content;

  const apiBaseUrl = "https://your_confluence.com/rest";
  const parentSurveyIdParam = "xxxxxxxxxxx"; // идентификатор родительского опроса

  document.getElementById("butform").addEventListener("click", butformclic);

  function butformclic() {
    // Заголовки для запроса клона родительского опроса
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const requestOptions = {
      method: "PUT",
      headers: headers,
      redirect: "follow",
      credentials: 'include'
    };

    // Получаем клон родительского опроса
    fetch(
      `${apiBaseUrl}/survey-response-service/1.0/survey/clone?surveyId=${parentSurveyIdParam}`,
      requestOptions
    )
      .then(response => response.text())
      .then(result => start(result))
      .catch(error => console.log("Ошибка получения опроса:", error));
  }

  // Обработка полученного клона опроса и запуск обновления страницы
  function start(body) {
    try {
      const obj = JSON.parse(body);
      const newParentSurveyId = obj.survey.id;
      alert("Клон родительского опроса с id: " + newParentSurveyId);

      // После получения родительского опроса обновляем страницу
      updateExistingPage(newParentSurveyId);
    } catch (err) {
      console.error("Ошибка разбора JSON:", err);
    }
  }

  // Функция обновления  страницы
  function updateExistingPage(parentSurveyId) {
    // получаем  страницу
    fetch(
      `${apiBaseUrl}/api/content/${existingPageId}?expand=body.storage,version,space`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: 'include'
      }
    )
      .then(response => response.json())
      .then(page => {
        const newVersion = page.version.number + 1;

        // вставка в контент страницы:
        const surveyMacro = `<p><ac:structured-macro ac:macro-id="9d76a711-a556-4d12-a627-ffbfa1c80e63" ac:name="surveydisplay" ac:schema-version="1">
  <ac:parameter ac:name="id">${parentSurveyId}</ac:parameter>
</ac:structured-macro></p>`;

        const currentContent = page.body.storage.value;
        const newContent = currentContent + surveyMacro;

        // json для обновления страницы
        const updateBody = {
          id: existingPageId,
          type: "page",
          title: page.title,
          space: {
            key: page.space.key
          },
          body: {
            storage: {
              value: newContent,
              representation: "storage"
            }
          },
          version: {
            number: newVersion
          }
        };

        // Обновляем страницу
        return fetch(`${apiBaseUrl}/api/content/${existingPageId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: 'include',
          body: JSON.stringify(updateBody)
        });
      })
      .then(response => response.json())
      .then(result => {
        console.log("Страница успешно обновлена:", result);
        alert("Страница успешно обновлена!");
      })
      .catch(error => {
        console.error("Ошибка при обновлении страницы:", error);
        alert("Ошибка при обновлении страницы");
      });
  }
</script>


