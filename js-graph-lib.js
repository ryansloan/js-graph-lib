//color array for setting colors of different bars, etc.
var colors=new Array("#00009f","#009f00","#9f0000","#78009f","#9f0050");
//holds all the charts on the current page. used for handling events
var charts = new Array();

function BarChart(el) {
    charts[el.id] = this;
    this.points = new Array();
    this.target = el;
    this.maxY=0;
	this.yAxisTitle="";
	this.xAxisTitle="";
	this.widthOfYLabels = 50;
	this.heightOfXLabels = 50;
    this.addPoint = function (xVal, yVal) {
            this.points.push({x: xVal,y: yVal});
            if (yVal>this.maxY) { this.maxY=Math.ceil(yVal*1.1); }

    }

    this.removePointByX = function (xVal) {
		//TODO: Fill this in. Traverse points in graph and pull out relevant point.
    }
    this.removePointByIndex = function (idx) {
        var removed = this.points.splice(idx,1);
        //update the maxY for the graph as well.
        if (this.maxY == Math.ceil(removed[0].y * 1.1)) {
            this.maxY = 0;
            for (var i = 0; i < this.points.length; i++) {
                if (this.points[i].y > this.maxY) {
                    this.maxY = this.points[i].y*1.1;
                }
            }
        }

    }

    this.redraw = function () {
        var w = this.target.width.baseVal.value;
        var h = this.target.height.baseVal.value;
        var n = this.points.length;

        var multiplier = (h - this.heightOfXLabels) / this.maxY;
        var barWidth = ((w - this.widthOfYLabels) / n) * .9; //take available width, divide by number of points, and take 90% of that. (Other 10% is for padding)
        var paddingBetweenBars = ((w - this.widthOfYLabels) / this.points.length) * .1; //todo: fix this to dynamically determine best value
        var currentBarEl;
        var currLabel;
        //in case the data gets passed in as an array, we check to make sure maxY is set to something that seems right.
        //This stuff is busted. when points is assigned to an array for a chart that already exists this gets blown up.
		
        /*if (this.maxY == 0) {
            for (var i = 0; i < this.points.length; i++) {
                if (this.points[i].y > this.maxY) {
                    this.maxY = this.points[i].y;
                }
            }
        }*/

        while (this.target.lastChild) {
            this.target.removeChild(this.target.lastChild);
        }
        //check to make sure there's enough room to represent the chart...
        if ((this.points.length + this.widthOfYLabels) > this.target.width.baseVal.value) {
            //if there's not print an error and don't draw.
            var errorMsg = document.createElementNS("http://www.w3.org/2000/svg", "text");
            errorMsg.setAttributeNS(null, "x", 0);
            errorMsg.setAttributeNS(null, "y", this.target.height.baseVal.value / 2);
            errorMsg.textContent = "Error. Too many elements for this size chart!";
            this.target.appendChild(errorMsg);
        }
        else {  
            for (var i = 0; i < this.points.length; i++) {
                //draw each point's rect element.
                currentBarEl = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                currentBarEl.setAttributeNS(null, "fill", colors[i % colors.length]);
                currentBarEl.setAttributeNS(null, "x", paddingBetweenBars * (i + 1) + i * barWidth+this.widthOfYLabels);
                currentBarEl.setAttributeNS(null, "y", Math.floor((this.maxY - this.points[i].y) * multiplier)); //why - 1? to account for zero!(we want to show something)
                currentBarEl.setAttributeNS(null, "height", Math.floor(this.points[i].y * multiplier) + 1);//why + 1? to account for zero! (we want to show something)
                currentBarEl.setAttributeNS(null, "width", barWidth);
                currentBarEl.addEventListener("click", showPointDetails); //show point detial window a graph element is clicked.
                currentBarEl.setAttributeNS(null, "id", this.target.id + "_" + i);
                this.target.appendChild(currentBarEl);
				
                //add label for the current point.
                currLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
                currLabel.setAttributeNS(null, "x", this.widthOfYLabels + barWidth * (i)+barWidth/2+paddingBetweenBars*(i+1));
                currLabel.setAttributeNS(null, "y", h-this.heightOfXLabels+10);
                currLabel.setAttributeNS(null, "fill", "#161616");
                currLabel.setAttributeNS(null, "font-size", "9pt");
                currLabel.setAttributeNS(null, "text-anchor", "middle");
                currLabel.textContent = this.points[i].x;
                this.target.appendChild(currLabel);
            }
			
            //draw y axis
            var currAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
            currAxis.setAttributeNS(null, "x1", 50);
            currAxis.setAttributeNS(null, "x2", 50);
            currAxis.setAttributeNS(null, "y1", 0);
            currAxis.setAttributeNS(null, "y2", h-50);
            currAxis.setAttributeNS(null, "stroke", "#262626");
            currAxis.setAttributeNS(null, "stroke-width", "1");
            this.target.appendChild(currAxis);
            currLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
			
            //draw y axis labels, leaving room between them and the axis itself
            currLabel.setAttributeNS(null, "x", this.widthOfYLabels - 1)
            currLabel.setAttributeNS(null, "y", 10);
            currLabel.setAttributeNS(null, "fill", "#161616");	
            currLabel.setAttributeNS(null, "font-size", "9pt");
            currLabel.setAttributeNS(null, "text-anchor", "end");
            currLabel.textContent = this.maxY;
            this.target.appendChild(currLabel);
            currLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
            currLabel.setAttributeNS(null, "x", this.widthOfYLabels - 1)
            currLabel.setAttributeNS(null, "y", h-this.heightOfXLabels);
            currLabel.setAttributeNS(null, "fill", "#161616");
            currLabel.setAttributeNS(null, "font-size", "9pt");
            currLabel.setAttributeNS(null, "text-anchor", "end");
            currLabel.textContent = "0";
            this.target.appendChild(currLabel);
			
			//Y Axis title
			currLabel=document.createElementNS("http://www.w3.org/2000/svg","text");
			currLabel.setAttributeNS(null, "x", Math.floor(this.widthOfYLabels-10));
			currLabel.setAttributeNS(null, "y", Math.floor((h-this.heightOfXLabels)/2));
			currLabel.setAttributeNS(null, "fill", "#161616");
			currLabel.setAttributeNS(null,"font-size", "9pt");
			currLabel.setAttributeNS(null,"text-anchor","middle");
			currLabel.setAttributeNS(null,"transform","rotate(270 "+Math.floor(this.widthOfYLabels-10)+","+(Math.floor((h-this.heightOfXLabels)/2))+")");
			currLabel.textContent=this.yAxisTitle;
			this.target.appendChild(currLabel);
			
            //draw x axis
            currAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
            currAxis.setAttributeNS(null, "x1", 50);
            currAxis.setAttributeNS(null, "x2", w);
            currAxis.setAttributeNS(null, "y1", h-50);
            currAxis.setAttributeNS(null, "y2", h - 50);
            currAxis.setAttributeNS(null, "stroke", "#262626");
            currAxis.setAttributeNS(null, "stroke-width", "1");
            this.target.appendChild(currAxis);
				
			//X Axis Title
			currLabel=document.createElementNS("http://www.w3.org/2000/svg","text");
			currLabel.setAttributeNS(null, "x", this.widthOfYLabels+(this.target.width.baseVal.value/2));
			currLabel.setAttributeNS(null, "y", h-Math.floor(this.heightOfXLabels/3));
			currLabel.setAttributeNS(null, "fill", "#161616");
			currLabel.setAttributeNS(null,"font-size", "9pt");
			currLabel.textContent=this.xAxisTitle;
			this.target.appendChild(currLabel);

        }

    }
    this.toString = function () {
        var ret = "";
        for (var i = 0; i < this.points.length; i++) {
            ret += "[" + this.points[i].x + "],[" + this.points[i].y + "]";
        }

        return ret;
    }
}

function destroyPointDetails(e) {
    var el = e.target.parentElement;
    var par = el.parentElement;
    par.removeChild(el);

}
//Point Detail window is a frame that appears over the graph with more detailed information on the point.
function showPointDetails(e) {
    //use id's of selected elements to get appropriate elements. HAX LOL
    var currentChart = charts[(e.target.id).slice(0, e.target.id.lastIndexOf("_"))];
    var currentPoint = currentChart.points[(e.target.id).slice(e.target.id.lastIndexOf("_") + 1)];
    var el;

    //destroy previous detail window (if one exists)
    if (document.getElementById("pointDetailsFrame" + currentChart.id)) {
        el = document.getElementById("pointDetailsFrame" + currentChart.id)
        var par = el.parentElement;
        par.removeChild(el);
    }	
    //create detail window and set necessary attributes
    var windowEl = document.createElement("div");
	var windowContentsEl = document.createElement("div");
    windowEl.className = "pointDetailsFrame";
    windowEl.setAttribute("id", "pointDetailsFrame" + currentChart.id);
    var x = currentChart.target.offsetLeft + (currentChart.target.width.baseVal.value / 3); //sort of an arbitrary position. it appears within the bounds of the graph
    var y = currentChart.target.offsetTop + (currentChart.target.height.baseVal.value / 3);
    windowEl.style.position="absolute";
    windowEl.style.left=x+"px";
    windowEl.style.top=y+"px";
    windowEl.style.minWidth = "50px"; //this is minWidth because we want to stretch horizontally for longer strings.
    windowEl.style.height = "50px";
    windowEl.style.paddingTop = "4px";
	windowEl.style.background = "#444444";
	windowEl.style.color = "#FFFFFF";
	windowEl.style.border = "1px solid #161616";
	windowContentsEl.innerHTML = "<strong>X</strong>:" + currentPoint.x+"<br />";
    windowContentsEl.innerHTML += "<strong>Y</strong>:" + currentPoint.y;
	windowContentsEl.style.marginRight="20px";
    var closeButton = document.createElement("span");
    closeButton.style.fontSize = "18";
    closeButton.innerHTML = "x";
    closeButton.style.position = "absolute";
    closeButton.style.top = 0;
    closeButton.style.right = 0;	
    closeButton.style.marginTop = "-4px";
    closeButton.addEventListener("click", destroyPointDetails);
    windowEl.appendChild(closeButton);
	windowEl.appendChild(windowContentsEl);
    document.body.appendChild(windowEl);
}

