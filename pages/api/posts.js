import { ApiError } from 'next/dist/server/api-utils';
import db from '../../database'
import { fetchJobList, fetchJobResult, getSolveTimeAndStatusOfJobId} from '../../util/lib/utils';

async function getUserName(api_key) {
  const user_sql = 'SELECT username FROM users WHERE api_key = ?';
  const user_params = [api_key];

  return new Promise((resolve, reject) => {
    db.get(user_sql, user_params, (err, row) => {
      if (err) {
        reject(new Error('Internal Server error'));
      } else if (row === undefined) {
        reject(new Error('api_key not found'));
      } else {
        resolve(row.username);
      }
    });
  });
}


async function getJobStatusById(job_id) {
  try {
    const data = await fetchJobList();
    // console.log("job_id : ", job_id)
    // console.log("posts.js line 26 data:", data);
    const job_status_list = data.job_status_list;
    const job_status = job_status_list.find((job) => job.job_id === job_id);
    // console.log("fujitsu job status", job_status)
    return job_status;
  } catch (err) {
    throw new Error('Error fetching Fujitsu job data');
  }
}

async function insertComputationData(username, job_id, job_status) {
  try{
    let sql, params;
    if (job_status === undefined) {
      // job_status is undefined when the job is not found on the fujitsu server
      sql = 'INSERT INTO test_service_stats (username, job_id) VALUES (?, ?) ON CONFLICT(job_id) DO UPDATE SET username = ?';
      params = [username, job_id, username];
    } else {
      sql = 'INSERT INTO test_service_stats (username, job_id, status, start_time) VALUES (?, ?, ?, ?) ON CONFLICT(job_id) DO UPDATE SET username = ?, status = ?, start_time = ?';
      params = [username, job_id, job_status.job_status, job_status.start_time, username, job_status.job_status, job_status.start_time];
    }

    return new Promise((resolve, reject) => {
      db.run(sql, params, (err) => {
        if (err) {
          reject(new Error('Internal Server error'));
        }
        resolve();
      });
    })
  }catch(err){
    throw new Error('Error inserting computation data :' + err.message);
  }
}


async function updateSolveTime(job_id) {
  try{
    const {solve_time, status} = await getSolveTimeAndStatusOfJobId(job_id);
    // update it into the database
    console.log("updaed solve time : ", solve_time),
    console.log("status : ", status)
    const sql = 'UPDATE test_service_stats SET computation_time_ms = ?, status = ? WHERE job_id = ?';
    const params = [solve_time, status, job_id];

    return new Promise((resolve, reject) => {
      db.run(sql, params, (err) => {
        if (err) {
          reject(new Error('Internal Server error'));
        }
        resolve();
      });
    });
  }catch(err){
    console.log(err.message)
    throw new Error('Error updating solve time :' + err.message);
  }
}

// post the following json object to this api
// {
//      "api_key" : "",
//      "job_id" : "",
//      "solve_time" : ""
// }
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { api_key, job_id, time_limit_sec } = req.body;
    try{
      const username = await getUserName(api_key);
      try{
        const job_status = await getJobStatusById(job_id);
        console.log("job_status of ", job_id, " : ", job_status);
        try{
          await insertComputationData(username, job_id, job_status);
          if(job_status !== undefined){
            // job_status is undefined when the job is not found on the fujitsu server
            // try to get the solution
            if(job_status.job_status === 'Done'){
              // get the solution immediately
              console.log("get solution immediately")
              updateSolveTime(job_id);
            }else{
              // set timer to wait
              console.log("set timer to wait")
              setTimeout(updateSolveTime, time_limit_sec * 1000, job_id) 
            }
          }
          res.status(200).json({'message' : 'success'});
        }catch(err){ // Failed to insert computation data
          // internal server error
          res.status(500).json({error : err.message});
        }
      }catch(err){ 
        // Failed to get the Job status
        // if it failes to get the job status, it means that the Fujitsu's server is dead
        res.status(400).json({error : err.message});
      }
    }catch(err){ // Failed to get the username
      // api_key not found
      console.log(err.message)
      res.status(401).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'only POST method allowed' });
  }
}
