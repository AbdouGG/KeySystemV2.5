local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local KeySystem = {}
KeySystem.__index = KeySystem

-- Configuration
local API_URL = "https://your-supabase-url.supabase.co"
local ANON_KEY = "your-anon-key"

function KeySystem.new()
    local self = setmetatable({}, KeySystem)
    self.validKeys = {}
    return self
end

-- Generate HWID for a player
local function generateHWID(player)
    -- Combine multiple identifying factors
    local hwid = string.format("%s-%s-%s",
        player.UserId,
        player.AccountAge,
        HttpService:GenerateGUID(false)
    )
    return hwid
end

-- Validate a key with HWID check
function KeySystem:validateKey(key, player)
    local success, result = pcall(function()
        local hwid = generateHWID(player)
        
        local headers = {
            ["apikey"] = ANON_KEY,
            ["Authorization"] = "Bearer " .. ANON_KEY,
            ["Content-Type"] = "application/json"
        }
        
        -- First, check if key exists and is valid
        local response = HttpService:RequestAsync({
            Url = API_URL .. "/rest/v1/keys?key=eq." .. key .. "&is_valid=eq.true&select=*",
            Method = "GET",
            Headers = headers
        })
        
        if response.Success then
            local data = HttpService:JSONDecode(response.Body)
            if #data > 0 then
                local keyData = data[1]
                local expiresAt = DateTime.fromIsoDate(keyData.expires_at)
                local now = DateTime.now()
                
                -- Check expiration
                if expiresAt.UnixTimestamp <= now.UnixTimestamp then
                    return false, "Key has expired"
                end
                
                -- Check HWID
                if keyData.hwid ~= "legacy" then
                    if keyData.hwid ~= hwid then
                        return false, "Key is bound to another user"
                    end
                else
                    -- Update HWID for legacy keys
                    local updateResponse = HttpService:RequestAsync({
                        Url = API_URL .. "/rest/v1/keys?key=eq." .. key,
                        Method = "PATCH",
                        Headers = headers,
                        Body = HttpService:JSONEncode({
                            hwid = hwid
                        })
                    })
                    
                    if not updateResponse.Success then
                        return false, "Failed to bind key to user"
                    end
                end
                
                return true, keyData
            end
        end
        
        return false, "Invalid key"
    end)
    
    if not success then
        return false, "Error validating key: " .. tostring(result)
    end
    
    return table.unpack(result)
end

local function onPlayerAdded(player)
    local function promptForKey()
        local screenGui = Instance.new("ScreenGui")
        local frame = Instance.new("Frame")
        local textBox = Instance.new("TextBox")
        local submitButton = Instance.new("TextButton")
        local statusLabel = Instance.new("TextLabel")
        
        frame.Size = UDim2.new(0, 300, 0, 200)
        frame.Position = UDim2.new(0.5, -150, 0.5, -100)
        frame.BackgroundColor3 = Color3.fromRGB(255, 255, 255)
        
        textBox.Size = UDim2.new(0.8, 0, 0, 30)
        textBox.Position = UDim2.new(0.1, 0, 0.3, 0)
        textBox.PlaceholderText = "Enter your key..."
        
        submitButton.Size = UDim2.new(0.8, 0, 0, 30)
        submitButton.Position = UDim2.new(0.1, 0, 0.5, 0)
        submitButton.Text = "Submit"
        
        statusLabel.Size = UDim2.new(0.8, 0, 0, 30)
        statusLabel.Position = UDim2.new(0.1, 0, 0.7, 0)
        statusLabel.Text = ""
        statusLabel.TextColor3 = Color3.fromRGB(255, 0, 0)
        
        textBox.Parent = frame
        submitButton.Parent = frame
        statusLabel.Parent = frame
        frame.Parent = screenGui
        screenGui.Parent = player.PlayerGui
        
        submitButton.MouseButton1Click:Connect(function()
            local key = textBox.Text
            local success, result = KeySystem:validateKey(key, player)
            
            if success then
                screenGui:Destroy()
                -- Grant access to game features
                print("Valid key for " .. player.Name)
            else
                textBox.Text = ""
                statusLabel.Text = tostring(result)
            end
        end)
    end
    
    promptForKey()
end

local keySystem = KeySystem.new()
Players.PlayerAdded:Connect(onPlayerAdded)

return KeySystem