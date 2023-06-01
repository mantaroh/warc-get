import gzip from 'node-gzip';
import lineByLine from 'n-readlines';
import parser from 'http-string-parser';
import { parse as HtmlParse } from 'node-html-parser';
import type { HTMLElement } from 'node-html-parser';

const BASE_URL   = "https://ds5q9oxwqwsfj.cloudfront.net";

type WARCData = {
    request: parser.ParseRequestResult | {},
    response: parser.ParseResponseResult | {},
    html: HTMLElement,
}    

/***
 * Get WARC data as Http Request and Response
 */
async function getWARCData(filePath: string, offset: number, length: number): Promise<WARCData> {
    try {
        const response = await fetch(`${BASE_URL}/${filePath}`, {
            headers: {
                "range": `bytes=${offset}-${offset + length - 1}`
            }
        });
        console.log(response.status);
        const dataBuffer = await response.arrayBuffer();
        const unzipData  = await gzip.ungzip(dataBuffer);

        // 取得データは、RequestとResponseが HTTP 1.1 に準拠して \r\n\r\n で結合されているので、分割する
        // 例：
        // <<Respons text>>
        // 
        // <<Response text>>
        // 
        // <<Data>>
        const req = parser.parseRequest(unzipData.toString().split("\r\n\r\n")[0]);
        const res = parser.parseResponse(unzipData.toString().split("\r\n\r\n")[1] + "\r\n\r\n" + unzipData.toString().split("\r\n\r\n")[2]);
        const html = HtmlParse(res.body);

        return {
            request: req,
            response: res,
            html: html,
        }
    } catch (error: Error | any) {
        console.error(error.message);
        // 例外時は処理を続けるために空のデータを返す
        return {
            request: {},
            response: {},
            html: HtmlParse(''),
        };
    }
}

/**
 * Main
 */
(async () => {
    // Sample Code:
    // const warcData = await getWARCData("crawl-data/CC-MAIN-2023-14/segments/1679296945287.43/warc/CC-MAIN-20230324144746-20230324174746-00262.warc.gz", 108147947, 1205);
    // const warcData = await getWARCData("crawl-data/CC-MAIN-2023-14/segments/1679296949107.48/crawldiagnostics/CC-MAIN-20230330070451-20230330100451-00355.warc.gz", 12249146, 882);
    // console.log('----- request -----')
    // console.log(warcData.request);
    // console.log('----- response -----')
    // console.log(warcData.response);
    // console.log('----- html -----')
    // console.log(warcData.html);

    try {
        const liner = new lineByLine('./sample.data');
        let line: false | Buffer;
        let count = 0;
        while (line = liner.next()) {
            console.log('**************************s')
            // 最初はインデックス用の TLD とパス名、日付が来るので、それ以降の JSON だけを取得する
            // データ例: jp,0-00)/dobutsubiyori 20230331150048 {"url":..... }
            const data = line.toString('utf8').substring(line.toString('utf8').indexOf('{'));
            const json = JSON.parse(data);
            console.log(json);

            const warcData = await getWARCData(json.filename, parseInt(json.offset), parseInt(json.length));
            console.log('----- request -----')
            console.log(warcData.request);
            console.log('----- response -----')
            console.log(warcData.response);
            console.log('----- html -----')
            console.log(warcData.html);

            console.log('**************************e')

            // TODO: Sample code. Remove it.
            count++;
            if (count >= 1) break;
        }
    } catch (error: Error | any) {
        console.error(error.message);
        process.exit(1);
    }
})();
