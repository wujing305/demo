class MathLib
{
    static approximate(a:number, b:number, error:number):boolean{
        return Math.abs(a-b) < error;
    }
}

export{
    MathLib
}