import { createConnection, Connection, getConnection } from 'typeorm';
import { Notice } from '../src/notice/notice.entity';
import { Department } from '../src/department/department.entity';

import * as ormConfig from '../src/ormconfig';

async function search(
  keyword: string,
  departments: number[],
  searchType: string,
) {
  let noticeNum = 0;
  const startTime = Date.now();
  for (let i = 0; i < departments.length; i++) {
    const noticeQb = getConnection()
      .getRepository(Notice)
      .createQueryBuilder('notice')
      .where('departmentId = :dId', { dId: departments[i] });
    if (searchType == 'LIKE') {
      noticeQb.andWhere('(contentText like :keyword or title like :keyword)', {
        keyword: `%${keyword}%`,
      });
    } else {
      noticeQb.andWhere(
        'match(contentText, title) against (+:keyword IN BOOLEAN MODE)',
        {
          keyword: keyword,
        },
      );
    }
    const notices = await noticeQb.limit(10).getMany();
    noticeNum += notices.length;
  }
  const endTime = Date.now();
  return { elapsedTime: endTime - startTime, noticeNum: noticeNum };
}

async function runBenchmark() {
  const connection: Connection = await createConnection(ormConfig);
  const departments = await getConnection()
    .getRepository(Notice)
    .createQueryBuilder('notice')
    .select('notice.departmentId, count(notice.id) as noticeCount, d.name')
    .innerJoin(Department, 'd', 'd.id = notice.departmentId')
    .groupBy('notice.departmentId')
    .orderBy('noticeCount', 'DESC')
    .getRawMany();
  const top10 = departments.slice(0, 10);

  console.log('department name: number of notices');
  top10.forEach((d) => {
    console.log(`${d.name.padEnd(15 - d.name.length)}: ${d.noticeCount}`);
  });

  const departmentIds = top10.map((d) => d.departmentId);
  const keywords = [
    'cse',
    '장학',
    'cbe',
    'zxcv',
    '화요일',
    '복수전공',
    'data',
    '졸업요건',
    '부전공',
    '비대면',
    '학사',
  ];

  for (let i = 0; i < keywords.length; i++) {
    const resultLike = [];
    const resultFTS = [];
    for (let j = 0; j < 5; j++) {
      resultLike.push(await search(keywords[i], departmentIds, 'LIKE'));
      resultFTS.push(await search(keywords[i], departmentIds, 'FTS'));
    }
    const sumLike = resultLike
      .map((r) => r.elapsedTime)
      .reduce((a, b) => a + b);
    const sumFTS = resultFTS.map((r) => r.elapsedTime).reduce((a, b) => a + b);
    console.log(``);
    console.log(`keyword: ${keywords[i]}`);
    console.log(
      `elapsed time - like: ${(sumLike / resultLike.length).toFixed(2)}ms`,
    );
    console.log(`num of notices - like: ${resultLike[0].noticeNum}`);

    //console.log(resultLike);
    console.log(
      `elapsed time - FTS: ${(sumFTS / resultFTS.length).toFixed(2)}ms`,
    );
    console.log(`num of notices - FTS: ${resultFTS[0].noticeNum}`);

    //console.log(resultFTS);
    console.log(`elapsed time ratio LIKE/FTS ${(sumLike / sumFTS).toFixed(2)}`);
  }
  await connection.close();
}

runBenchmark();
