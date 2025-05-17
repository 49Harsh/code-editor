const express = require('express');
const { exec, spawn } = require('child_process');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store active sessions
const activeSessions = new Map();

// Directory for temporary code files
let TEMP_DIR = path.join(__dirname, 'temp');

// Track if Docker is available
let isDockerAvailable = false;

// Check if Docker is available and working
(async () => {
  try {
    console.log('Checking Docker availability...');
    // First create temp directory if needed
    await fs.mkdir(TEMP_DIR, { recursive: true });
    console.log('Temporary directory created at:', TEMP_DIR);
    
    // Check if directory is writable
    try {
      const testFile = path.join(TEMP_DIR, 'test-write.txt');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      console.log('Temporary directory is writable');
    } catch (err) {
      console.error('Temporary directory is not writable:', err);
    }
    
    // Check if Docker is available with a simple command that actually tries to run a container
    exec('docker run --rm hello-world', (error, stdout, stderr) => {
      if (error) {
        console.log('Docker is not available or not working properly:', error.message);
        isDockerAvailable = false;
        console.log('Falling back to direct execution mode');
      } else {
        console.log('Docker is available and working properly');
        isDockerAvailable = true;
      }
    });
  } catch (err) {
    console.error('Error with temp directory:', err);
    
    // Try creating in a different location as fallback
    try {
      const altTempDir = path.join(process.cwd(), 'temp');
      await fs.mkdir(altTempDir, { recursive: true });
      console.log('Using alternative temp directory:', altTempDir);
      // Use this directory instead
      TEMP_DIR = altTempDir;
    } catch (fallbackErr) {
      console.error('Failed to create fallback temp directory:', fallbackErr);
    }
  }
})();

// Map of file extensions for supported languages
const fileExtensions = {
  javascript: 'js',
  python: 'py',
  java: 'java',
  cpp: 'cpp',
  c: 'c'
};

// Map of Docker images for each language
const dockerImages = {
  javascript: 'node:18-alpine',
  python: 'python:3.10-alpine',
  java: 'openjdk:17-alpine',
  cpp: 'gcc:latest',
  c: 'gcc:latest'
};

// Map of run commands for each language
const runCommands = {
  javascript: 'node',
  python: 'python',
  java: (filename) => {
    const className = path.basename(filename, '.java');
    return `javac ${filename} && java ${className}`;
  },
  cpp: (filename) => {
    const execName = path.basename(filename, '.cpp');
    return `g++ ${filename} -o ${execName} && ./${execName}`;
  },
  c: (filename) => {
    const execName = path.basename(filename, '.c');
    return `gcc ${filename} -o ${execName} && ./${execName}`;
  }
};

// Map of direct execution commands for when Docker isn't available
const localCommands = {
  javascript: 'node',
  python: 'python',
  java: 'java',
  cpp: 'g++',
  c: 'gcc'
};

// Check if commands are available locally
const checkLocalCommands = () => {
  for (const [lang, cmd] of Object.entries(localCommands)) {
    exec(`${cmd} --version`, (error) => {
      if (error) {
        console.log(`${lang} (${cmd}) is not available locally`);
      } else {
        console.log(`${lang} (${cmd}) is available locally`);
      }
    });
  }
};

// Check local commands availability
checkLocalCommands();

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  const sessionId = socket.handshake.query.sessionId;
  
  if (sessionId && activeSessions.has(sessionId)) {
    const session = activeSessions.get(sessionId);
    session.socket = socket;
    
    // Handle input from client
    socket.on('input', (data) => {
      if (session.dockerProcess && session.dockerProcess.stdin) {
        session.dockerProcess.stdin.write(data + '\n');
        console.log(`Input sent to container for session ${sessionId}: ${data}`);
      }
    });
  }
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Clean up sessions with this socket
    for (let [id, session] of activeSessions.entries()) {
      if (session.socket === socket) {
        console.log(`Cleaning up session ${id}`);
        killDockerProcess(session);
      }
    }
  });
});

// Kill a Docker process
function killDockerProcess(session) {
  if (session.dockerProcess) {
    try {
      session.dockerProcess.kill();
    } catch (err) {
      console.error('Error killing Docker process:', err);
    }
  }
  
  // Clean up temp files
  if (session.filepath) {
    fs.unlink(session.filepath).catch(err => {
      console.error('Error deleting file:', err);
    });
  }
  
  if (session.inputPath) {
    fs.unlink(session.inputPath).catch(err => {
      console.error('Error deleting input file:', err);
    });
  }
}

// Execute code with direct execution (no Docker)
const executeDirectly = async (language, filepath, inputPath, runCallback) => {
  const filename = path.basename(filepath);
  let cmd, args;
  
  // Prepare command based on language
  switch(language) {
    case 'python':
      cmd = 'python';
      args = [filepath];
      break;
    case 'javascript':
      cmd = 'node';
      args = [filepath];
      break;
    default:
      runCallback({
        success: false,
        output: '',
        error: `Direct execution not supported for ${language}`,
        exitCode: -1
      });
      return;
  }
  
  console.log(`Direct execution: ${cmd} ${args.join(' ')}`);
  
  try {
    // For non-interactive execution, use exec
    if (!inputPath) {
      exec(`${cmd} ${args.join(' ')}`, (error, stdout, stderr) => {
        if (error) {
          runCallback({
            success: false,
            output: stdout || '',
            error: stderr || error.message,
            exitCode: error.code || -1
          });
        } else {
          runCallback({
            success: true,
            output: stdout || '',
            error: stderr || '',
            exitCode: 0
          });
        }
      });
    }
    // For interactive execution, use spawn
    else {
      const inputContent = await fs.readFile(inputPath, 'utf8');
      const childProcess = spawn(cmd, args);
      
      let stdout = '';
      let stderr = '';
      
      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      childProcess.on('close', (code) => {
        runCallback({
          success: code === 0,
          output: stdout,
          error: stderr,
          exitCode: code || 0
        });
      });
      
      // Write input to stdin if available
      if (inputContent) {
        childProcess.stdin.write(inputContent);
        childProcess.stdin.end();
      }
    }
  } catch (err) {
    runCallback({
      success: false,
      output: '',
      error: `Error during direct execution: ${err.message}`,
      exitCode: -1
    });
  }
};

// Execute code in Docker container or directly
app.post('/api/execute', async (req, res) => {
  const { code, language, input = '' } = req.body;
  
  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }
  
  // Create unique ID for this execution
  const executionId = uuidv4();
  const extension = fileExtensions[language];
  const filename = `code_${executionId}.${extension}`;
  const filepath = path.join(TEMP_DIR, filename);
  
  try {
    // Write code to file
    await fs.writeFile(filepath, code);
    
    // Prepare input file if needed
    let inputPath = '';
    if (input) {
      inputPath = path.join(TEMP_DIR, `input_${executionId}.txt`);
      await fs.writeFile(inputPath, input);
    }
    
    // If Docker is not available, execute directly
    if (!isDockerAvailable) {
      console.log('Docker not available, executing code directly');
      
      if (req.body.interactive) {
        // Create session ID for interactive mode
        const sessionId = uuidv4();
        
        // Start a local process for interactive execution
        // (This is a limited implementation since true interactivity is harder without Docker)
        const localProcess = spawn(
          language === 'python' ? 'python' : 
          language === 'javascript' ? 'node' : 'echo',
          [filepath],
          { stdio: ['pipe', 'pipe', 'pipe'] }
        );
        
        // Store session info
        activeSessions.set(sessionId, {
          dockerProcess: localProcess, // Using the same field name for compatibility
          filepath,
          inputPath,
          socket: null
        });
        
        // Handle output
        localProcess.stdout.on('data', (data) => {
          const output = data.toString();
          console.log(`stdout from local ${sessionId}:`, output);
          
          // Send to client if socket is connected
          const session = activeSessions.get(sessionId);
          if (session && session.socket) {
            session.socket.emit('output', output);
          }
        });
        
        localProcess.stderr.on('data', (data) => {
          const errorOutput = data.toString();
          console.error(`stderr from local ${sessionId}:`, errorOutput);
          
          // Send to client if socket is connected
          const session = activeSessions.get(sessionId);
          if (session && session.socket) {
            session.socket.emit('output', errorOutput);
          }
        });
        
        // Handle process exit
        localProcess.on('exit', (code) => {
          console.log(`Local process ${sessionId} exited with code ${code}`);
          
          // Send exit status to client
          const session = activeSessions.get(sessionId);
          if (session && session.socket) {
            session.socket.emit('exit', { code });
          }
          
          // Clean up
          activeSessions.delete(sessionId);
          fs.unlink(filepath).catch(err => console.error('Error deleting file:', err));
          if (inputPath) {
            fs.unlink(inputPath).catch(err => console.error('Error deleting input file:', err));
          }
        });
        
        // If there's initial input, provide it
        if (input) {
          localProcess.stdin.write(input);
          localProcess.stdin.end(); // Close stdin after input
        }
        
        // Return session ID to client
        return res.status(200).json({
          success: true,
          sessionId,
          message: 'Interactive local session started'
        });
      } else {
        // Non-interactive mode
        executeDirectly(language, filepath, inputPath, (result) => {
          // Clean up files
          Promise.all([
            fs.unlink(filepath).catch(() => {}),
            inputPath ? fs.unlink(inputPath).catch(() => {}) : Promise.resolve()
          ]).finally(() => {
            res.status(result.success ? 200 : 400).json(result);
          });
        });
        return; // Early return to avoid the Docker code path
      }
    } 
    // Docker is available, use it
    else {
      // Get Docker image and command
      const dockerImage = dockerImages[language];
      if (!dockerImage) {
        return res.status(400).json({ error: 'Unsupported language' });
      }

      let runCommand;
      if (typeof runCommands[language] === 'function') {
        runCommand = runCommands[language](filename);
      } else {
        runCommand = `${runCommands[language]} ${filename}`;
      }
      
      // For non-interactive execution (simple response)
      if (!req.body.interactive) {
        // Build Docker command with Windows-compatible path
        // Convert Windows path to Docker-compatible path
        const dockerTempDir = TEMP_DIR.replace(/\\/g, '/').replace('C:', '/c');
        
        // Use different command format based on OS
        let dockerCommand;
        if (process.platform === 'win32') {
          // Windows-specific command (PowerShell compatible)
          dockerCommand = `docker run --rm -v "${dockerTempDir}:/code" -w /code ${dockerImage} /bin/sh -c "${runCommand}"`;
          
          if (inputPath) {
            // Use a temporary file for input on Windows
            dockerCommand = `Get-Content "${inputPath.replace(/\\/g, '/')}" | ${dockerCommand}`;
          }
        } else {
          // Unix-compatible command
          dockerCommand = `docker run --rm -v "${dockerTempDir}:/code" -w /code ${dockerImage} /bin/sh -c "${runCommand}"`;
          
          if (inputPath) {
            dockerCommand += ` < ${path.basename(inputPath)}`;
          }
        }
        
        console.log(`Executing [${process.platform}]: ${dockerCommand}`);
        
        // Execute in Docker with appropriate shell
        const shellOptions = {
          timeout: 10000,
          shell: process.platform === 'win32' ? 'powershell.exe' : true
        };
        
        exec(dockerCommand, shellOptions, async (error, stdout, stderr) => {
          // Attempt to clean up temp files
          try {
            await fs.unlink(filepath);
            if (inputPath) await fs.unlink(inputPath);
          } catch (cleanupErr) {
            console.error('Error cleaning up temp files:', cleanupErr);
          }
          
          if (error) {
            console.error('Docker execution error:', error);
            
            if (error.killed) {
              return res.status(400).json({
                success: false,
                output: stdout || '',
                error: 'Execution timed out or was killed',
                exitCode: error.code || -1
              });
            }
            
            return res.status(400).json({
              success: false,
              output: stdout || '',
              error: `Docker error: ${error.message}`,
              exitCode: error.code || -1
            });
          }
          
          return res.status(200).json({
            success: true,
            output: stdout || '',
            error: stderr || '',
            exitCode: 0
          });
        });
      } 
      // For interactive execution (WebSocket)
      else {
        const sessionId = uuidv4();
        
        // Convert Windows path to Docker-compatible path format
        const dockerTempDir = TEMP_DIR.replace(/\\/g, '/').replace('C:', '/c');
        
        // Get appropriate spawn command based on OS
        let spawnCmd = 'docker';
        let spawnArgs = [
          'run',
          '-i', // Interactive mode
          '--rm',
          '-v', `${dockerTempDir}:/code`,
          '-w', '/code',
          dockerImage,
          '/bin/sh', '-c', runCommand
        ];
        
        // On Windows, use PowerShell to spawn Docker
        if (process.platform === 'win32') {
          spawnCmd = 'powershell.exe';
          spawnArgs = [
            'docker', 'run', '-i', '--rm',
            '-v', `"${dockerTempDir}:/code"`,
            '-w', '/code',
            dockerImage,
            '/bin/sh', '-c', `"${runCommand}"`
          ];
        }
        
        console.log(`Starting interactive session ${sessionId}`);
        console.log(`Docker command: ${spawnCmd} ${spawnArgs.join(' ')}`);
        
        // Spawn Docker process
        const dockerProcess = spawn(spawnCmd, spawnArgs, {
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: process.platform === 'win32'
        });
        
        // Store session info
        activeSessions.set(sessionId, {
          dockerProcess,
          filepath,
          inputPath,
          socket: null // Will be set when client connects
        });
        
        // Flag to detect early Docker failure
        let dockerFailed = false;
        let errorMessage = '';
        
        // Handle Docker errors that might occur during startup
        dockerProcess.on('error', (error) => {
          console.error(`Docker process error for ${sessionId}:`, error);
          dockerFailed = true;
          errorMessage = error.message;
          
          // Clean up
          activeSessions.delete(sessionId);
        });
        
        // Handle output
        dockerProcess.stdout.on('data', (data) => {
          const output = data.toString();
          console.log(`stdout from ${sessionId}:`, output);
          
          // Send to client if socket is connected
          const session = activeSessions.get(sessionId);
          if (session && session.socket) {
            session.socket.emit('output', output);
          }
        });
        
        // Handle error output and detect Docker startup issues
        dockerProcess.stderr.on('data', (data) => {
          const errorOutput = data.toString();
          console.error(`stderr from ${sessionId}:`, errorOutput);
          
          // Check for Docker connection errors
          if (errorOutput.includes('error during connect') || 
              errorOutput.includes('Cannot connect to the Docker daemon')) {
            dockerFailed = true;
            errorMessage = errorOutput;
          }
          
          // Send to client if socket is connected
          const session = activeSessions.get(sessionId);
          if (session && session.socket) {
            session.socket.emit('output', errorOutput);
          }
        });
        
        // Handle process exit
        dockerProcess.on('exit', (code) => {
          console.log(`Docker process ${sessionId} exited with code ${code}`);
          
          // Send exit status to client
          const session = activeSessions.get(sessionId);
          if (session && session.socket) {
            session.socket.emit('exit', { code });
          }
          
          // If Docker failed early, fall back to direct execution
          if (dockerFailed && code !== 0) {
            console.log(`Docker failed for ${sessionId}, falling back to direct execution`);
            
            // Fall back to direct execution for this session
            const fallbackProcess = spawn(
              language === 'python' ? 'python' : 
              language === 'javascript' ? 'node' : 'echo',
              [filepath],
              { stdio: ['pipe', 'pipe', 'pipe'] }
            );
            
            // Update session with new process
            const session = activeSessions.get(sessionId);
            if (session) {
              session.dockerProcess = fallbackProcess;
              
              // Connect existing socket if available
              if (session.socket) {
                session.socket.emit('output', '\n--- Docker failed, falling back to local execution ---\n');
              }
              
              // Handle output from fallback
              fallbackProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(`Fallback stdout from ${sessionId}:`, output);
                
                if (session.socket) {
                  session.socket.emit('output', output);
                }
              });
              
              fallbackProcess.stderr.on('data', (data) => {
                const errorOutput = data.toString();
                console.error(`Fallback stderr from ${sessionId}:`, errorOutput);
                
                if (session.socket) {
                  session.socket.emit('output', errorOutput);
                }
              });
              
              fallbackProcess.on('exit', (code) => {
                console.log(`Fallback process ${sessionId} exited with code ${code}`);
                
                if (session.socket) {
                  session.socket.emit('exit', { code });
                }
                
                // Final cleanup
                activeSessions.delete(sessionId);
                fs.unlink(filepath).catch(err => console.error('Error deleting file:', err));
                if (inputPath) {
                  fs.unlink(inputPath).catch(err => console.error('Error deleting input file:', err));
                }
              });
              
              // If there's a socket connected and it sends input
              if (session.socket) {
                session.socket.on('input', (data) => {
                  if (fallbackProcess.stdin) {
                    fallbackProcess.stdin.write(data + '\n');
                  }
                });
              }
            }
          } else {
            // Normal cleanup when Docker worked fine
            activeSessions.delete(sessionId);
            fs.unlink(filepath).catch(err => console.error('Error deleting file:', err));
            if (inputPath) {
              fs.unlink(inputPath).catch(err => console.error('Error deleting input file:', err));
            }
          }
        });
        
        // Return session ID to client before we know if Docker works
        // The client will connect with WebSocket and handle any errors
        return res.status(200).json({
          success: true,
          sessionId,
          message: 'Interactive session started'
        });
      }
    }
  } catch (err) {
    console.error('Error executing code:', err);
    return res.status(500).json({
      success: false,
      output: '',
      error: 'Server error while executing code: ' + err.message,
      exitCode: -1
    });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Docker execution server running on port ${PORT}`);
}); 