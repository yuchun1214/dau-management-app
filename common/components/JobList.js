import React, { useEffect, useState, useContext} from 'react'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import LoginContext, { LoginProvider }from '../contexts/LoginContext';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import DeleteMessageModal from './DeleteSuccessfullyModal';

function Entry({index, data, isLoggedIn}){
    
    const [ isVisiable, setIsVisiable] = useState(true);
    const [ showDeleteModal, setShowDeleteModal ] = useState(false);
    const [ showDeleteMessageModal, setShowDeleteMessageModal ] = useState(false);

    const deleteBtnHandler = () => setShowDeleteModal(true);
    const hideModalHandler = () => setShowDeleteModal(false);


    const deleteMessageModalCloseHandler = () => {
        setShowDeleteMessageModal(false);
        setIsVisiable(false);
    }


    const deleteHandler = () => {
        setShowDeleteModal(false);

        const endpoint = '/api/jobs';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // should provide session key
            body: JSON.stringify({
                job_id: data.job_id
            })
        }

        const response = fetch(endpoint, options).then(
            (response)=> response.status).then((status)=>{
                console.log('status : ', status)
                if(status === 200){
                    console.log('delete successfully')
                    setShowDeleteMessageModal(true);
                }
            })
    }

    if(!isVisiable){
        return null;
    }

    // console.log("line 43", isLoggedIn);
    
    return (
        <>
            <tr>
                <td>{index}</td>
                <td>{data.job_id}</td>
                <td>{data.username}</td>
                <td>{data.job_status}</td>
                <td>{data.start_time}</td>
                {
                    isLoggedIn && <td><Button variant="outline-danger" onClick={deleteBtnHandler}>Delete</Button></td>
                }
            </tr>

            <ConfirmDeleteModal show={showDeleteModal} handleClose={hideModalHandler}  handleDelete={deleteHandler} user={data.username} job_id={data.job_id}/>
            <DeleteMessageModal show={showDeleteMessageModal} handleClose={deleteMessageModalCloseHandler} user={data.username} job_id={data.job_id}/>
        </>
    )
}

export default function JobList({data}) {

    // fetch data from /api/jobs
    const [jobs, setJobs] = useState(null);
    const [jobs_string, setJobsString] = useState(null);
    useEffect(()=>{

        const fetchJobs = async () => {
            const endpoint = '/api/jobs';
            const options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            fetch(endpoint, options)
            .then((response) => response.json())
            .then((data)=>{ 
                console.log('data : ', data["job_status_list"])
                setJobs(data["job_status_list"])
                setJobsString(JSON.stringify(data))
            }).catch((err) =>{
                console.log('Error fetching jobs ', err)
            })
        }

        fetchJobs();
        return ()=>{};
        // const intervalId = setInterval(()=>{
        //     fetchJobs();
        // }, 100000)
        // return () => clearInterval(intervalId); 
    }, [])

    const { isLoggedIn } = useContext(LoginContext);


    return (
        <>
        <Table striped bordered>
      <thead>
        <tr>
          <th>#</th>
          <th>Job Id</th>
          <th>User</th>
          <th>Job Status</th>
          <th>Start time</th>
          { isLoggedIn && <th>Delete</th>}
        </tr>
      </thead>
      <tbody>
            {jobs && jobs.map((job, index) => {
                return <Entry key={index} data={job} index={index} isLoggedIn={isLoggedIn} />
                    
            })}
      </tbody>
    </Table>
        </>
    );
}