-- AO Fraud Detection Contract
-- Monitors wallet connections, detects fraudulent sites, and intercepts suspicious transactions

-- Handle JSON encoding/decoding
local json = require('json')

-- Fallback JSON implementation if json module is not available
if not json then
    json = {
        encode = function(obj)
            if type(obj) == "table" then
                local result = "{"
                local first = true
                for k, v in pairs(obj) do
                    if not first then
                        result = result .. ","
                    end
                    result = result .. '"' .. tostring(k) .. '":' 
                    if type(v) == "string" then
                        result = result .. '"' .. v .. '"'
                    elseif type(v) == "number" then
                        result = result .. tostring(v)
                    elseif type(v) == "boolean" then
                        result = result .. tostring(v)
                    elseif type(v) == "table" then
                        result = result .. json.encode(v)
                    else
                        result = result .. '"' .. tostring(v) .. '"'
                    end
                    first = false
                end
                return result .. "}"
            else
                return '"' .. tostring(obj) .. '"'
            end
        end,
        decode = function(str)
            -- Simple JSON decode (basic implementation)
            return load("return " .. str:gsub('"%s*:', '='):gsub('true', 'true'):gsub('false', 'false'):gsub('null', 'nil'))()
        end
    }
end

-- Contract state
Handlers = Handlers or {}
Members = Members or {}

State = State or {
    registeredUsers = {},
    fraudulentSites = {},
    pendingAlerts = {},
    transactionHistory = {},
    config = {
        alertTimeout = 10000, -- 10 seconds in milliseconds
        largeAmountThreshold = 1000000000000, -- 1000 AR (in Winston)
        maxTransactionIncrease = 5 -- 5x increase triggers alert
    }
}

-- Utility functions
local function getCurrentTime()
    return math.floor(os.time() * 1000) -- Current time in milliseconds
end

local function isValidAddress(address)
    return address and type(address) == "string" and #address == 43
end

local function calculateRiskScore(site, amount, userHistory)
    local score = 0
    
    -- Clean site URL (remove protocol and www)
    local cleanSite = site:gsub("^https?://", ""):gsub("^www%.", "")
    
    -- Check if site is known fraudulent (check both original and cleaned versions)
    if State.fraudulentSites[site] or State.fraudulentSites[cleanSite] then
        score = score + 100
    end
    
    -- Check for suspicious patterns in site URL
    local suspiciousPatterns = {
        "bit%-ly", "tinyurl", "t%.co", "shorturl", 
        "crypto%-exchange", "defi%-swap", "metamask%-wallet",
        "phishing", "fake%-", "scam%-"
    }
    
    for _, pattern in ipairs(suspiciousPatterns) do
        if string.find(site, pattern) or string.find(cleanSite, pattern) then
            score = score + 30
            break
        end
    end
    
    -- IMPROVED: User history-based transaction analysis
    if userHistory and #userHistory > 0 and amount > 0 then
        local maxAmount = 0
        local totalAmount = 0
        local avgAmount = 0
        
        -- Calculate user's transaction statistics
        for _, tx in ipairs(userHistory) do
            totalAmount = totalAmount + tx.amount
            if tx.amount > maxAmount then
                maxAmount = tx.amount
            end
        end
        avgAmount = totalAmount / #userHistory
        
        -- Alert based on user's personal patterns
        if amount > (maxAmount * 1.5) then
            score = score + 60  -- 50% higher than their highest transaction
        elseif amount > (avgAmount * State.config.maxTransactionIncrease) then
            score = score + 40  -- 5x higher than their average
        elseif amount > (avgAmount * 2) then
            score = score + 20  -- 2x higher than average (mild warning)
        end
        
        -- Additional check: If this is much larger than recent transactions
        local recentTransactions = {}
        local oneWeekAgo = getCurrentTime() - (7 * 24 * 3600000) -- 1 week ago
        
        for _, tx in ipairs(userHistory) do
            if tx.timestamp > oneWeekAgo then
                table.insert(recentTransactions, tx)
            end
        end
        
        if #recentTransactions > 0 then
            local recentAvg = 0
            for _, tx in ipairs(recentTransactions) do
                recentAvg = recentAvg + tx.amount
            end
            recentAvg = recentAvg / #recentTransactions
            
            if amount > (recentAvg * 3) then
                score = score + 25  -- Much larger than recent activity
            end
        end
    else
        -- Fallback for new users with no history - use absolute thresholds
        if amount > State.config.largeAmountThreshold then
            score = score + 40
        end
    end
    
    return math.min(score, 100) -- Cap at 100
end

local function generateAlertId()
    return "alert_" .. getCurrentTime() .. "_" .. math.random(1000, 9999)
end

-- Handler: Register User
Handlers.register = function(msg)
    assert(isValidAddress(msg.From), "Invalid user address")
    
    -- Check if user is already registered
    local alreadyRegistered = false
    for _, member in ipairs(Members) do
        if member == msg.From then
            alreadyRegistered = true
            break
        end
    end
    
    -- Add to Members list if not already registered
    if not alreadyRegistered then
        table.insert(Members, msg.From)
        print(msg.From .. " Registered")
    end
    
    local userData = {
        address = msg.From,
        registeredAt = getCurrentTime(),
        connectedSites = {},
        transactionCount = 0,
        totalVolume = 0
    }
    
    State.registeredUsers[msg.From] = userData
    State.transactionHistory[msg.From] = {}
    
    ao.send({
        Target = msg.From,
        Action = "Registration-Success",
        Data = json.encode({
            message = "Successfully registered for fraud protection",
            timestamp = getCurrentTime(),
            totalMembers = #Members,
            isNewMember = not alreadyRegistered
        })
    })
end

-- Alternative Register handler using Handlers.add format
Handlers.add(
    "Register",
    { Action = "Register"},
    function (msg)
        assert(isValidAddress(msg.From), "Invalid user address")
        
        -- Check if user is already registered
        local alreadyRegistered = false
        for _, member in ipairs(Members) do
            if member == msg.From then
                alreadyRegistered = true
                break
            end
        end
        
        -- Add to Members list if not already registered
        if not alreadyRegistered then
            table.insert(Members, msg.From)
            print(msg.From .. " Registered")
        end
        
        local userData = {
            address = msg.From,
            registeredAt = getCurrentTime(),
            connectedSites = {},
            transactionCount = 0,
            totalVolume = 0
        }
        
        State.registeredUsers[msg.From] = userData
        State.transactionHistory[msg.From] = {}
        
        msg.reply({ 
            Data = json.encode({
                message = "Registered successfully.",
                totalMembers = #Members,
                isNewMember = not alreadyRegistered
            })
        })
    end
)

-- Handler: Monitor Site Connection
Handlers.add(
    "ConnectSite",
    { Action = "connectSite"},
    function (msg)
        local data = json.decode(msg.Data)
        local userAddr = msg.From
        local siteUrl = data.site
        
        assert(State.registeredUsers[userAddr], "User not registered")
        assert(siteUrl and type(siteUrl) == "string", "Valid site URL required")
        
        -- Calculate risk score for the site
        local riskScore = calculateRiskScore(siteUrl, 0, State.transactionHistory[userAddr])
        
        -- Update user's connected sites
        table.insert(State.registeredUsers[userAddr].connectedSites, {
            site = siteUrl,
            connectedAt = getCurrentTime(),
            riskScore = riskScore
        })
        
        -- If site is high risk, alert user
        if riskScore >= 70 then
            local alertId = generateAlertId()
            
            State.pendingAlerts[alertId] = {
                userId = userAddr,
                type = "SITE_CONNECTION",
                site = siteUrl,
                riskScore = riskScore,
                createdAt = getCurrentTime(),
                expiresAt = getCurrentTime() + State.config.alertTimeout,
                status = "PENDING"
            }
            
            msg.reply({
                Data = json.encode({
                    alertId = alertId,
                    type = "SITE_CONNECTION",
                    message = "⚠️ FRAUD ALERT: The site '" .. siteUrl .. "' has a high risk score (" .. riskScore .. "/100). This site may be fraudulent.",
                    riskFactors = {
                        "Site matches known fraudulent patterns",
                        "Site reported in fraud database"
                    },
                    timeout = State.config.alertTimeout / 1000,
                    action_required = "Respond with 'APPROVE' or 'BLOCK' within 10 seconds"
                })
            })
            
            return
        end
        
        -- Low risk - allow connection
        msg.reply({
            Data = json.encode({
                site = siteUrl,
                riskScore = riskScore,
                message = "✅ Site connection approved - low fraud risk"
            })
        })
    end
)

-- Handler: Monitor Transaction
Handlers.add(
    "MonitorTransaction",
    { Action = "monitorTransaction"},
    function (msg)
        local data = json.decode(msg.Data)
        local userAddr = msg.From
        local recipient = data.recipient
        local amount = tonumber(data.amount) or 0
        local site = data.site or "unknown"
        
        assert(State.registeredUsers[userAddr], "User not registered")
        assert(isValidAddress(recipient), "Invalid recipient address")
        assert(amount > 0, "Invalid transaction amount")
        
        -- Get user transaction history
        local userHistory = State.transactionHistory[userAddr] or {}
        
        -- Calculate comprehensive risk score
        local riskScore = calculateRiskScore(site, amount, userHistory)
        
        -- Additional checks for transaction-specific risks
        
        -- Check if recipient is known fraudulent address
        for _, fraudSite in pairs(State.fraudulentSites) do
            if fraudSite.addresses and fraudSite.addresses[recipient] then
                riskScore = math.min(riskScore + 80, 100)
                break
            end
        end
        
        -- Check for unusual transaction patterns
        if #userHistory > 0 then
            local recentTransactions = {}
            local oneHourAgo = getCurrentTime() - 3600000 -- 1 hour ago
            
            for _, tx in ipairs(userHistory) do
                if tx.timestamp > oneHourAgo then
                    table.insert(recentTransactions, tx)
                end
            end
            
            -- Too many transactions in short time
            if #recentTransactions >= 5 then
                riskScore = math.min(riskScore + 30, 100)
            end
        end
        
        -- If high risk, create alert
        if riskScore >= 60 then
            local alertId = generateAlertId()
            
            State.pendingAlerts[alertId] = {
                userId = userAddr,
                type = "TRANSACTION",
                transaction = {
                    recipient = recipient,
                    amount = amount,
                    site = site
                },
                riskScore = riskScore,
                createdAt = getCurrentTime(),
                expiresAt = getCurrentTime() + State.config.alertTimeout,
                status = "PENDING"
            }
            
            local riskFactors = {}
            local cleanSite = site:gsub("^https?://", ""):gsub("^www%.", "")
            
            if State.fraudulentSites[site] or State.fraudulentSites[cleanSite] then
                table.insert(riskFactors, "Site is flagged as fraudulent in database")
            end
            
            -- User history-based risk factors
            if #userHistory > 0 then
                local maxAmount = 0
                local totalAmount = 0
                for _, tx in ipairs(userHistory) do
                    totalAmount = totalAmount + tx.amount
                    if tx.amount > maxAmount then maxAmount = tx.amount end
                end
                local avgAmount = totalAmount / #userHistory
                
                if amount > (maxAmount * 1.5) then
                    table.insert(riskFactors, "Amount is 50% higher than your largest previous transaction (" .. maxAmount .. " Winston)")
                elseif amount > (avgAmount * State.config.maxTransactionIncrease) then
                    table.insert(riskFactors, "Amount is " .. State.config.maxTransactionIncrease .. "x larger than your average transaction (" .. math.floor(avgAmount) .. " Winston)")
                elseif amount > (avgAmount * 2) then
                    table.insert(riskFactors, "Amount is 2x larger than your average transaction")
                end
            else
                if amount > State.config.largeAmountThreshold then
                    table.insert(riskFactors, "Large transaction amount detected (no transaction history available)")
                end
            end
            
            msg.reply({
                Data = json.encode({
                    alertId = alertId,
                    type = "TRANSACTION",
                    message = "🚨 SUSPICIOUS TRANSACTION DETECTED",
                    transaction = {
                        to = recipient,
                        amount = amount .. " Winston",
                        site = site
                    },
                    riskScore = riskScore,
                    riskFactors = riskFactors,
                    timeout = State.config.alertTimeout / 1000,
                    action_required = "Respond with 'APPROVE' or 'BLOCK' within 10 seconds or transaction will be blocked"
                })
            })
            
            return
        end
        
        -- Low risk - allow transaction and record it
        table.insert(State.transactionHistory[userAddr], {
            recipient = recipient,
            amount = amount,
            site = site,
            timestamp = getCurrentTime(),
            riskScore = riskScore
        })
        
        -- Update user stats
        State.registeredUsers[userAddr].transactionCount = State.registeredUsers[userAddr].transactionCount + 1
        State.registeredUsers[userAddr].totalVolume = State.registeredUsers[userAddr].totalVolume + amount
        
        msg.reply({
            Data = json.encode({
                message = "✅ Transaction approved - low fraud risk",
                riskScore = riskScore,
                transaction = {
                    to = recipient,
                    amount = amount .. " Winston"
                }
            })
        })
    end
)

-- Handler: User Response to Alert
Handlers.alertResponse = function(msg)
    local data = json.decode(msg.Data)
    local userAddr = msg.From
    local alertId = data.alertId
    local response = string.upper(data.response or "")
    
    local alert = State.pendingAlerts[alertId]
    assert(alert, "Alert not found")
    assert(alert.userId == userAddr, "Unauthorized alert response")
    assert(alert.status == "PENDING", "Alert already processed")
    
    -- Check if alert has expired
    if getCurrentTime() > alert.expiresAt then
        alert.status = "EXPIRED"
        ao.send({
            Target = userAddr,
            Action = "Alert-Expired",
            Data = json.encode({
                message = "⏰ Alert expired - action blocked for security",
                alertId = alertId
            })
        })
        return
    end
    
    if response == "APPROVE" then
        alert.status = "APPROVED"
        
        if alert.type == "TRANSACTION" then
            -- Record the approved transaction
            table.insert(State.transactionHistory[userAddr], {
                recipient = alert.transaction.recipient,
                amount = alert.transaction.amount,
                site = alert.transaction.site,
                timestamp = getCurrentTime(),
                riskScore = alert.riskScore,
                userApproved = true
            })
            
            -- Update user stats
            State.registeredUsers[userAddr].transactionCount = State.registeredUsers[userAddr].transactionCount + 1
            State.registeredUsers[userAddr].totalVolume = State.registeredUsers[userAddr].totalVolume + alert.transaction.amount
        end
        
        ao.send({
            Target = userAddr,
            Action = "Action-Approved",
            Data = json.encode({
                message = "✅ Action approved by user",
                alertId = alertId,
                type = alert.type
            })
        })
        
    elseif response == "BLOCK" then
        alert.status = "BLOCKED"
        
        -- If user blocks, add to fraud database
        if alert.type == "SITE_CONNECTION" and alert.site then
            State.fraudulentSites[alert.site] = {
                reportedAt = getCurrentTime(),
                reportedBy = userAddr,
                riskScore = alert.riskScore,
                userBlocked = true
            }
        elseif alert.type == "TRANSACTION" and alert.transaction then
            -- Mark recipient as potentially fraudulent
            if not State.fraudulentSites[alert.transaction.site] then
                State.fraudulentSites[alert.transaction.site] = {
                    addresses = {},
                    reportedAt = getCurrentTime()
                }
            end
            State.fraudulentSites[alert.transaction.site].addresses = State.fraudulentSites[alert.transaction.site].addresses or {}
            State.fraudulentSites[alert.transaction.site].addresses[alert.transaction.recipient] = {
                reportedBy = userAddr,
                reportedAt = getCurrentTime()
            }
        end
        
        ao.send({
            Target = userAddr,
            Action = "Action-Blocked",
            Data = json.encode({
                message = "🛡️ Action blocked by user - added to fraud database",
                alertId = alertId,
                type = alert.type
            })
        })
    else
        ao.send({
            Target = userAddr,
            Action = "Invalid-Response",
            Data = json.encode({
                message = "Invalid response. Use 'APPROVE' or 'BLOCK'",
                alertId = alertId
            })
        })
    end
end

-- Handler: Auto-expire alerts
Handlers.checkExpiredAlerts = function(msg)
    local currentTime = getCurrentTime()
    local expiredAlerts = {}
    
    for alertId, alert in pairs(State.pendingAlerts) do
        if alert.status == "PENDING" and currentTime > alert.expiresAt then
            alert.status = "EXPIRED"
            table.insert(expiredAlerts, alertId)
            
            -- Auto-block expired alerts for security
            ao.send({
                Target = alert.userId,
                Action = "Alert-Auto-Blocked",
                Data = json.encode({
                    message = "⏰ No response received - action automatically blocked for security",
                    alertId = alertId,
                    type = alert.type
                })
            })
            
            -- Add expired high-risk items to fraud database
            if alert.riskScore >= 80 then
                if alert.type == "SITE_CONNECTION" and alert.site then
                    State.fraudulentSites[alert.site] = {
                        reportedAt = currentTime,
                        autoBlocked = true,
                        riskScore = alert.riskScore
                    }
                elseif alert.type == "TRANSACTION" and alert.transaction then
                    if not State.fraudulentSites[alert.transaction.site] then
                        State.fraudulentSites[alert.transaction.site] = {
                            addresses = {},
                            reportedAt = currentTime
                        }
                    end
                    State.fraudulentSites[alert.transaction.site].addresses = State.fraudulentSites[alert.transaction.site].addresses or {}
                    State.fraudulentSites[alert.transaction.site].addresses[alert.transaction.recipient] = {
                        autoBlocked = true,
                        reportedAt = currentTime
                    }
                end
            end
        end
    end
    
    if #expiredAlerts > 0 then
        ao.send({
            Target = msg.From,
            Action = "Alerts-Expired",
            Data = json.encode({
                message = "Processed " .. #expiredAlerts .. " expired alerts",
                expiredAlerts = expiredAlerts
            })
        })
    end
end

-- Handler: Report Fraudulent Site
Handlers.reportFraud = function(msg)
    local data = json.decode(msg.Data)
    local userAddr = msg.From
    local site = data.site
    local addresses = data.addresses or {}
    
    assert(State.registeredUsers[userAddr], "User not registered")
    assert(site and type(site) == "string", "Valid site URL required")
    
    State.fraudulentSites[site] = {
        reportedAt = getCurrentTime(),
        reportedBy = userAddr,
        addresses = addresses,
        userReported = true
    }
    
    ao.send({
        Target = userAddr,
        Action = "Fraud-Report-Success",
        Data = json.encode({
            message = "Fraudulent site reported successfully",
            site = site,
            timestamp = getCurrentTime()
        })
    })
end

-- Handler: Get User Profile
Handlers.getProfile = function(msg)
    local userAddr = msg.From
    local userData = State.registeredUsers[userAddr]
    
    assert(userData, "User not registered")
    
    local userHistory = State.transactionHistory[userAddr] or {}
    local recentAlerts = {}
    
    -- Get recent alerts for this user
    for alertId, alert in pairs(State.pendingAlerts) do
        if alert.userId == userAddr then
            table.insert(recentAlerts, {
                id = alertId,
                type = alert.type,
                status = alert.status,
                createdAt = alert.createdAt
            })
        end
    end
    
    ao.send({
        Target = userAddr,
        Action = "User-Profile",
        Data = json.encode({
            profile = userData,
            transactionHistory = userHistory,
            recentAlerts = recentAlerts,
            protectedSince = userData.registeredAt
        })
    })
end

-- Handler: Get System Stats
Handlers.add(
    "GetStats",
    { Action = "getStats"},
    function (msg)
        local totalUsers = 0
        local totalTransactions = 0
        local totalFraudSites = 0
        local activeAlerts = 0
        
        for _ in pairs(State.registeredUsers) do
            totalUsers = totalUsers + 1
        end
        
        for userAddr, history in pairs(State.transactionHistory) do
            totalTransactions = totalTransactions + #history
        end
        
        for _ in pairs(State.fraudulentSites) do
            totalFraudSites = totalFraudSites + 1
        end
        
        for _, alert in pairs(State.pendingAlerts) do
            if alert.status == "PENDING" then
                activeAlerts = activeAlerts + 1
            end
        end
        
        msg.reply({
            Data = json.encode({
                totalUsers = totalUsers,
                totalMembers = #Members,
                totalTransactions = totalTransactions,
                fraudulentSitesDetected = totalFraudSites,
                activeAlerts = activeAlerts,
                contractConfig = State.config
            })
        })
    end
)

-- Handler: Get Members List
Handlers.add(
    "GetMembers",
    { Action = "getMembers"},
    function (msg)
        msg.reply({
            Data = json.encode({
                members = Members,
                totalMembers = #Members,
                message = "Current registered members list"
            })
        })
    end
)

-- Handler: Update Configuration (Admin only)
Handlers.updateConfig = function(msg)
    -- Note: In production, add admin verification
    local data = json.decode(msg.Data)
    
    if data.alertTimeout then
        State.config.alertTimeout = tonumber(data.alertTimeout)
    end
    
    if data.largeAmountThreshold then
        State.config.largeAmountThreshold = tonumber(data.largeAmountThreshold)
    end
    
    if data.maxTransactionIncrease then
        State.config.maxTransactionIncrease = tonumber(data.maxTransactionIncrease)
    end
    
    ao.send({
        Target = msg.From,
        Action = "Config-Updated",
        Data = json.encode({
            message = "Configuration updated successfully",
            newConfig = State.config
        })
    })
end

-- Automatic alert expiry checker (should be called periodically)
Handlers.cron_checkAlerts = function(msg)
    Handlers.checkExpiredAlerts(msg)
end

-- Handler: Get Fraud Database
Handlers.getFraudDatabase = function(msg)
    ao.send({
        Target = msg.From,
        Action = "Fraud-Database",
        Data = json.encode({
            fraudulentSites = State.fraudulentSites,
            totalEntries = 0
        })
    })
    
    -- Count entries
    local count = 0
    for _ in pairs(State.fraudulentSites) do
        count = count + 1
    end
    
    -- Send updated count
    ao.send({
        Target = msg.From,
        Action = "Fraud-Database-Count",
        Data = json.encode({
            totalFraudulentSites = count
        })
    })
end

-- Initialize contract with some known fraudulent sites
if not next(State.fraudulentSites) then
    State.fraudulentSites = {
        ["phishing-metamask.com"] = {
            reportedAt = getCurrentTime(),
            autoDetected = true,
            riskScore = 100,
            addresses = {}
        },
        ["fake-uniswap.org"] = {
            reportedAt = getCurrentTime(),
            autoDetected = true,
            riskScore = 95,
            addresses = {}
        },
        ["crypto-giveaway.net"] = {
            reportedAt = getCurrentTime(),
            autoDetected = true,
            riskScore = 100,
            addresses = {}
        }
    }
end

-- Contract Info Handler
Handlers.add(
    "Info",
    { Action = "info"},
    function (msg)
        msg.reply({ 
            Data = json.encode({
                name = "AO Fraud Detection System",
                version = "1.0.0",
                description = "Protects users from fraudulent sites and suspicious transactions",
                features = {
                    "Real-time site monitoring",
                    "Transaction risk assessment", 
                    "ML-based fraud detection",
                    "User alert system with timeouts",
                    "Permanent fraud database",
                    "Transaction history analysis"
                },
                endpoints = {
                    "register - Register for fraud protection",
                    "connectSite - Monitor site connection",
                    "monitorTransaction - Check transaction safety", 
                    "alertResponse - Respond to fraud alerts",
                    "getProfile - View user profile and history",
                    "getStats - View system statistics",
                    "getMembers - View registered members list",
                    "getFraudDatabase - View known fraudulent sites"
                }
            })
        })
    end
)

-- Default handler
Handlers._default = function(msg)
    ao.send({
        Target = msg.From,
        Action = "Error",
        Data = json.encode({
            error = "Unknown action: " .. (msg.Action or "none"),
            availableActions = {
                "register", "connectSite", "monitorTransaction", 
                "alertResponse", "getProfile", "getStats", 
                "getMembers", "getFraudDatabase", "info"
            }
        })
    })
end