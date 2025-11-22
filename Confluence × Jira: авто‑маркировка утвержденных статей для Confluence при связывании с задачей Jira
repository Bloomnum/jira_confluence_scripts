import groovyx.net.http.RESTClient
import static groovyx.net.http.ContentType.JSON


// Получаем global ID страницы триггера
def globalId = event.getGlobalId() //your global ID : appId=xxxxxxxxxxx&pageId=xxxxxxxxxxx

List<String> firstIssue = new ArrayList<>()

// Далее чтобы найти задачу в jira , в которой произошоло добавление Confluence странички :

// 1) Ищем все задачи jira с этим global ID страницы триггера
// 2) И после jql запроса получаем список задач
// 3) Далее сортируем задачи по дате обновления, и находим нашу нужную задачу (та в которую была добавлена страничка конфлюенс)

def issues = Issues.search("issue in (issuesWithRemoteLinksByGlobalId(\"$globalId\")) ORDER BY updated DESC")

// Перебор задач
for (issue in issues) {
    // Добавление ключа задачи в список
    firstIssue.add(issue.key)

    // Проверка, достигнута ли первая задача
    if (firstIssue.size() == 1) {
        // Прекращение выполнения цикла
        break
    }
}

def issue_with_confl_page = firstIssue[0].toString()
log.warn("Задача в которой добавили конфл страничку:" + issue_with_confl_page)
def issue_with_confl_page_key = Issues.getByKey(issue_with_confl_page)


// 1) Проект = SIRIUS И Тип задачи = Техническая консультация
if(issue_with_confl_page_key.issueType.name == 'Техническая консультация'){

    def page_confl_global = event.getGlobalId()

    // Получение id страницы
    def parts = page_confl_global.split("pageId=")

    if(parts.length > 1){
        def pageId = parts[1]  // ID CONFLUENCE PAGE
        log.warn("Page ID: $pageId")



    //API CONFLUENCE

// Получаем контент страницы

        def urlBase = "https://your_confluence.com/rest/api/content/"
        def contentId = "$pageId" // ID страницы
        def authToken = "your token"

        def client = new RESTClient(urlBase)

        try {
        def response = client.get(
        path: "${contentId}",
        contentType: JSON,
        headers: [
        Accept: 'application/json',
        Authorization: "Bearer ${authToken}" // Используем токен в формате Bearer
        ]
        )

        if (response.data) {

        def space_confl = response.data.space.key
        log.warn("Space: $space_confl")


//Проверка на спейс конфл Knowledge Base . Ключ : sdkb
            if(space_confl == 'your space key'){

                // Проверка на статус страницы бляь

                def urlBaseStatus = "https://your_confluence.com/rest/cw/1/content/$pageId/status"

                //def authToken = "your token" // токен доступа

                def clientStatus = new RESTClient(urlBaseStatus)

                try {
                def response_status = clientStatus.get(
                contentType: JSON,
                headers: [
                Accept: 'application/json',
                Authorization: "Bearer ${authToken}"
                ]
                )

                log.warn("Status: ${response_status.status}")
                if (response_status.data) {
                def status_page = response_status.data.state.name
                log.warn("Status confluence page: ${status_page}")


                    //Если статус = 'Утвержден' -> Добавляем label на страницу
                    if(status_page == 'Утвержден'){

                        // ADD LABEL

                        def baseUrl = "https://your_confluence.com"
                        //def contentId = "$pageId"
                        def labelName = "kb-article-is-up-to-date"

                        // Создание клиента REST
                        def clientLabel = new RESTClient("${baseUrl}/rest/api")

                        // Подготовка тела запроса
                        def requestBody = [prefix: "global", name: labelName]

                        // Заголовки запроса
                        def headers = [
                        Accept: 'application/json',
                        Authorization: "Bearer ${authToken}"
                        ]

                        // Выполнение POST-запроса
                        try {
                        def responseLabel = clientLabel.post(
                        uri: "${baseUrl}/rest/api/content/${contentId}/label",
                        requestContentType: JSON,
                        body: requestBody,
                        headers: headers
                        )

                        // Логирование результата
                        log.warn("Лейбл успешно добавлен на страницу")
                        //log.warn("Body: ${responseLabel.data?.toString()}")


                        } catch (Exception e) {
                        log.warn("Error: ${e.message}")
                        }
                    }
                }
                } catch (Exception e) {
                log.warn("Error: ${e.message}")
                }




            }// конец спейса



        }

        }
        catch (Exception e) {
        log.warn("Error: ${e.message}")
        }


    }
    else {
        log.warn("No page ID found.")
    }

}


