<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskToUsers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TaskController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $userId = auth()->user()->id;
        $data=Task::with(['assigned.user','assignedBy'])->where('assigned_by', $userId)->get();
        return response()->json([
            'success' => true,
            'message' => 'successful',
            'data' => $data
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->validate($request,[
            'title'=>'required',
            'description'=>'sometimes',
            'deadline'=>'required',
            'priority' => 'required|integer|in:1,2,3',
            'task_files'  => 'nullable|array',
            'task_files.*' => 'file|mimes:jpg,jpeg,png,pdf,doc,docx,xls,xlsx,zip,rar|max:25120',
        ]);

        $uploadedFilesData = [];

        if ($request->hasFile('task_files')) {
            foreach ($request->file('task_files') as $file) {
                if ($file->isValid()) {
                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $filePath = public_path('task_files') . DIRECTORY_SEPARATOR . $fileName;
                    $file->move(public_path('task_files'), $fileName);

                    $originalFileName = $file->getClientOriginalName();

                    $uploadedFilesData[] = [
                        'id' => (string)uniqid(),
                        'original_name' => $originalFileName,
                        'stored_path'   => '/task_files/' . $fileName,
                    ];
                }
            }
        }

        try {
            $data=Task::create([
                'title'=>$request->title,
                'description'=>$request->description,
                'deadline'=>$request->deadline,
                'assigned_by'=>auth()->user()->id,
                'priority'=>$request->priority,
                'attachments' => !empty($uploadedFilesData) ? json_encode($uploadedFilesData) : null,
            ]);
            if ($data){
                return response()->json([
                    'success' => true,
                    'message' => 'Task created successfully',
                    'data' => $data
                ], 200);
            }
        }catch (\Exception $e){
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null
            ], $e->getCode());
        }
        return response()->json([
            'success' => false,
            'message' => 'Task creation Failed',
            'data' => null
        ], 500);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $this->validate($request,[
            'title'=>'required',
            'description'=>'sometimes',
            'deadline'=>'required',
            'priority' => 'required|integer|in:1,2,3',
            'task_files.*' => 'nullable|file|max:2048',
            'files_to_remove.*' => 'nullable|string',
        ]);

        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Task not found.',
                'data' => null
            ], 404); // Not Found
        }

        DB::beginTransaction();
        try {
            $task->title = $request->title;
            $task->description = $request->description;
            $task->deadline = $request->deadline;
            $task->priority = $request->priority;

            $currentAttachments = json_decode($task->attachments, true) ?: [];
            $filesToRemoveIds = $request->input('files_to_remove', []);

            $updatedAttachments = [];

            foreach ($currentAttachments as $attachment) {
                if (isset($attachment['id']) && in_array($attachment['id'], $filesToRemoveIds)) {
                    $filePath = public_path() . $attachment['stored_path'];
                } else {
                    $updatedAttachments[] = $attachment;
                }
            }

            if ($request->hasFile('task_files')) {
                foreach ($request->file('task_files') as $file) {
                    if ($file->isValid()) {
                        $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                        $file->move(public_path('task_files'), $fileName);
                        $originalFileName = $file->getClientOriginalName();

                        $updatedAttachments[] = [
                            'id' => (string)uniqid(),
                            'original_name' => $originalFileName,
                            'stored_path' => '/task_files/' . $fileName,
                        ];
                    }
                }
            }

            $task->attachments = json_encode($updatedAttachments);
            $task->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Task updated successfully!',
                'data' => $task
            ], 200); // HTTP 200 OK

        } catch (\Exception $e) {
            DB::rollBack(); // Rollback the transaction if any error occurred
            return response()->json([
                'success' => false,
                'message' => 'Failed to update task: ' . $e->getMessage(),
                'data' => null
            ], 500); // HTTP 500 Internal Server Error
        }
        return response()->json([
            'success' => false,
            'message' => 'Task update Failed',
            'data' => null
        ], 500);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $data=Task::where('id',$id)->delete();
            if ($data){
                return response()->json([
                    'success' => true,
                    'message' => 'Task Deleted successfully',
                    'data' => $data
                ], 200);
            }
        }catch (\Exception $e){
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null
            ], $e->getCode());
        }
        return response()->json([
            'success' => false,
            'message' => 'Task delete Failed',
            'data' => null
        ], 500);
    }

    public function task_assign(Request $request)
    {
        $user=User::find($request->assigned_to);
        if ($user == null){
            return response()->json([
                'success' => false,
                'message' => 'No User Found',
                'data' => null
            ], 500);
        }
        $task=Task::find($request->task_id);
        if ($task == null){
            return response()->json([
                'success' => false,
                'message' => 'No Task Found',
                'data' => null
            ], 500);
        }
        try {
            $data=TaskToUsers::updateOrCreate([
                'assigned_to'=>$request->assigned_to,
                'task_id'=>$request->task_id,
            ],[]);
            if ($data){
                return response()->json([
                    'success' => true,
                    'message' => 'Task Assign successful',
                    'data' => $data
                ], 200);
            }
        }catch (\Exception $e){
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null
            ], $e->getCode());
        }
    }

}
