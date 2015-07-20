var transactionTypeBarChartDirectiveModule = angular.module('transactionTypeBarChartDirectiveModule', ['transactionTypeBarChartControllerModule']);

transactionTypeBarChartDirectiveModule.directive('transactionTypeBarChart',['queryFilter', function(queryFilter){
    function updateSize(data){
        var width =(window.innerWidth * .3), height = (window.innerHeight*.28);
        if (data === 0){
            d3.select("#transactionTypeBarChart").select("svg").remove();
            var svg = d3.select("#transactionTypeBarChart").append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width*.13 + "," + height*.5 + ")");
            svg.append("text").text("No Data Available");
            return;
        }
        barChart(data, "updateChart");
        return;
    }
    function barChart(data, status){
        var width = (window.innerWidth*.30), height = (window.innerHeight*.28);
        var color = d3.scale.category20();
        var barChart = {};
        function upDateTreemap(filterCriteria){
            queryFilter.appendQuery("transactionType",filterCriteria._id);
            queryFilter.broadcast();
        };
        barChart.createChart = function(data){
            var x = d3.scale.ordinal().rangeRoundBands([0, width*.5], .1);
            var y = d3.scale.linear().range([height*.8, 0]);
            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(5, "");
            var svg = d3.select("#transactionType")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width*.1 + "," + height*.1 + ")");
            x.domain(//sort by descending order
                data.sort(function(a,b){return b.count - a.count})
                    .map(function(d){return d._id;}))
                    .copy();
            y.domain([0, d3.max(data, function(d) { return d.count; })]);
            
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height*.8 + ")")
                .call(xAxis);
//}); 
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
              .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 2)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Count");
      
            svg.selectAll(".bar").data(data)
                .enter().append("rect")
                .on("click", function(d){upDateTreemap(d);})
                .style("fill", function(d,i){return color(i);})
                .attr("class", "bar")
                //.attr("x", function(d) { return x(d._id)+5; })
                .attr("x", function(d){return x(d._id)+5;})
                .attr("width", x.rangeBand())
                .transition()
                .delay(function(d,i){return i*100;})
                .attr("y", function(d,i) { return y(d.count)*.8; })
                .attr("height", function(d) { return (height - y(d.count))*.8; });
        };
        if(status === "updateChart"){
            console.log("In update")
            d3.select("#transactionTypeBarChart").select("svg").remove();
            var svg = d3.select("#transactionTypeBarChart").append("svg").attr("width",width).attr("height",height);
            svg.append("g").attr("id","transactionType")
                .append("text").attr("transform", "translate(0,15)").text("Transaction Type Chart");
            barChart.createChart(data);
            return;
        };
        if(status === "no_data"){ //Will append a Message for no data and return out of the function
            d3.select("#transactionTypeBarChart").select("svg").remove();
            var svg = d3.select("#transactionTypeBarChart").append("svg").attr("width", width).attr("height", height);
            svg.append("g").attr("transform", "translate(" + width*.13 + "," + height*.5 + ")");
            svg.append("text").text("No Data Available")
            return;
        };
        if(status === "createChart"){
            d3.select("#transactionTypeBarChart").select("svg").remove();
            var svg = d3.select("#transactionTypeBarChart").append("svg").attr("width",width).attr("height",height);
            svg.append("g").attr("id","transactionType");
            svg.append("text").attr("transform", "translate(0,15)").text("Transaction Type Chart");
            barChart.createChart(data);
        };
    };
    function link(scope){
        scope.$watch('transactionTypeBarChartPromise', function(){
            scope.transactionTypeBarChartPromise.then(function(getCall){ //handles the promise\
                if(getCall.data._size === 0){
                    scope.transactionTypeTempData = 0;
                    barChart(0, "no_data");
                    return;
                }
                var temp = getCall.data._embedded['rh:doc'];
                scope.transactionTypeTempData = temp;
                barChart(temp, "createChart");
            });
            $(window).resize(function(){
                updateSize(scope.transactionTypeTempData);
            })
        });
    };
    return{
        restrict: 'E',
        link: link,
        controller: 'transactionTypeBarChartController'
    };
}]);